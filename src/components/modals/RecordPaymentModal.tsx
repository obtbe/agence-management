import React, { useState, useEffect } from 'react';
import { X, Check, CreditCard, Smartphone, Building, DollarSign, Receipt, Share2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';
import { formatFCFA, buildWhatsAppLink, getRentReceiptWhatsAppMessage } from '../../utils/formatters';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPropertyId?: string;
  preselectedTenantId?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  preselectedPropertyId,
  preselectedTenantId,
}) => {
  const { 
    properties, 
    tenants, 
    recordPayment, 
    currentMonthYear, 
    agencyProfile,
    language 
  } = useApp();

  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [monthYear, setMonthYear] = useState<string>(currentMonthYear);
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('orange_money');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [datePaid, setDatePaid] = useState<string>(new Date().toISOString().split('T')[0]);
  const [recordedResult, setRecordedResult] = useState<any | null>(null);

  // Sync when opening
  useEffect(() => {
    if (isOpen) {
      setRecordedResult(null);
      if (preselectedPropertyId) {
        setSelectedPropertyId(preselectedPropertyId);
        const prop = properties.find((p) => p.id === preselectedPropertyId);
        if (prop) {
          setAmount(prop.rentAmount);
          if (prop.currentTenantId) {
            setSelectedTenantId(prop.currentTenantId);
          }
        }
      } else if (preselectedTenantId) {
        setSelectedTenantId(preselectedTenantId);
        const tenant = tenants.find((t) => t.id === preselectedTenantId);
        if (tenant?.currentPropertyId) {
          setSelectedPropertyId(tenant.currentPropertyId);
          const prop = properties.find((p) => p.id === tenant.currentPropertyId);
          if (prop) setAmount(prop.rentAmount);
        }
      } else {
        // Default to first occupied property
        const occupied = properties.find((p) => p.status === 'occupied');
        if (occupied) {
          setSelectedPropertyId(occupied.id);
          setAmount(occupied.rentAmount);
          if (occupied.currentTenantId) setSelectedTenantId(occupied.currentTenantId);
        }
      }
    }
  }, [isOpen, preselectedPropertyId, preselectedTenantId, properties, tenants]);

  // When tenant changes, sync property and rent
  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    const tenant = tenants.find((t) => t.id === tenantId);
    if (tenant?.currentPropertyId) {
      setSelectedPropertyId(tenant.currentPropertyId);
      const prop = properties.find((p) => p.id === tenant.currentPropertyId);
      if (prop) setAmount(prop.rentAmount);
    }
  };

  // When property changes, sync tenant and rent
  const handlePropertyChange = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    const prop = properties.find((p) => p.id === propertyId);
    if (prop) {
      setAmount(prop.rentAmount);
      if (prop.currentTenantId) {
        setSelectedTenantId(prop.currentTenantId);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId || !selectedTenantId || amount <= 0) return;

    const result = recordPayment({
      propertyId: selectedPropertyId,
      tenantId: selectedTenantId,
      monthYear,
      amount: Number(amount),
      paymentMethod,
      transactionRef: transactionRef || undefined,
      notes: notes || undefined,
      datePaid,
    });

    setRecordedResult(result);
  };

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);
  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {language === 'FR' ? 'Enregistrer un encaissement de loyer' : 'Record Rent Collection'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'FR' 
                ? 'Saisie directe sans intermédiaire financier · Reçu immédiat' 
                : 'Direct recording · Instant quittance generation'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {recordedResult ? (
          // Success view with WhatsApp link & receipt action
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {language === 'FR' ? 'Paiement Enregistré avec Succès !' : 'Payment Recorded Successfully!'}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Quittance N° <span className="font-mono font-bold text-slate-800">{recordedResult.receiptNumber}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {formatFCFA(recordedResult.amount)} reçu de {selectedTenant?.fullName}
              </p>
            </div>

            <div className="pt-3 flex flex-col gap-2.5">
              {selectedTenant && selectedProperty && (
                <a
                  href={buildWhatsAppLink(
                    selectedTenant.whatsappNumber || selectedTenant.phone,
                    getRentReceiptWhatsAppMessage({
                      tenantName: selectedTenant.fullName,
                      propertyTitle: selectedProperty.title,
                      monthYear: recordedResult.monthYear,
                      amountFCFA: recordedResult.amount,
                      receiptNumber: recordedResult.receiptNumber,
                      agencyName: agencyProfile.name,
                    })
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{language === 'FR' ? 'Envoyer confirmation par WhatsApp' : 'Send receipt via WhatsApp'}</span>
                </a>
              )}

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
              >
                {language === 'FR' ? 'Fermer' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          // Form view
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Property Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'FR' ? 'Bien concerné' : 'Property'}
              </label>
              <select
                value={selectedPropertyId}
                onChange={(e) => handlePropertyChange(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="">Sélectionnez un bien immobilier...</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.commune}) — {formatFCFA(p.rentAmount)}
                  </option>
                ))}
              </select>
            </div>

            {/* Tenant Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'FR' ? 'Locataire' : 'Tenant'}
              </label>
              <select
                value={selectedTenantId}
                onChange={(e) => handleTenantChange(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="">Sélectionnez le locataire...</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} · {t.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Month & Amount Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'FR' ? 'Mois concerné' : 'Rent Month'}
                </label>
                <input
                  type="month"
                  value={monthYear}
                  onChange={(e) => setMonthYear(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'FR' ? 'Montant reçu (FCFA)' : 'Amount Paid (FCFA)'}
                </label>
                <input
                  type="number"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  min="1"
                  step="1000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {language === 'FR' ? 'Mode de paiement Bamako' : 'Payment Method'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'orange_money', label: 'Orange Money' },
                  { id: 'wave', label: 'Wave Mali' },
                  { id: 'bank_transfer', label: 'Virement BDM/BOA' },
                  { id: 'moov_money', label: 'Moov Money' },
                  { id: 'cash', label: 'Espèces (Caisse)' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setPaymentMethod(item.id as PaymentMethod)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors flex items-center gap-2 ${
                      paymentMethod === item.id
                        ? 'bg-amber-50 border-amber-500 text-amber-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${paymentMethod === item.id ? 'bg-amber-600' : 'bg-slate-300'}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Reference */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'FR' ? 'Date de versement' : 'Payment Date'}
                </label>
                <input
                  type="date"
                  value={datePaid}
                  onChange={(e) => setDatePaid(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'FR' ? 'Réf transaction / Reçu' : 'Tx Reference'}
                </label>
                <input
                  type="text"
                  placeholder="ex: OM-893012 ou VIR-BDM"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Observations */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'FR' ? 'Observations (facultatif)' : 'Notes (optional)'}
              </label>
              <input
                type="text"
                placeholder="ex: Payé à terme échu, reçu remis en main propre"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
              >
                {language === 'FR' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
              >
                {language === 'FR' ? 'Enregistrer l\'encaissement' : 'Save Payment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
