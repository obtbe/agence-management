import React, { useState } from 'react';
import { X, RefreshCw, Share2, Calendar, DollarSign, Check } from 'lucide-react';
import { Lease, Property, Tenant } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatFCFA, formatDateFR, buildWhatsAppLink, getLeaseExpiringWhatsAppMessage } from '../../utils/formatters';

interface RenewLeaseModalProps {
  lease: Lease | null;
  onClose: () => void;
}

export const RenewLeaseModal: React.FC<RenewLeaseModalProps> = ({ lease, onClose }) => {
  const { properties, tenants, renewLease, agencyProfile, language } = useApp();

  if (!lease) return null;

  const property = properties.find((p) => p.id === lease.propertyId);
  const tenant = tenants.find((t) => t.id === lease.tenantId);

  // Default next end date + 1 year from current end date
  const computeNextYearDate = (currentDateStr: string) => {
    try {
      const d = new Date(currentDateStr);
      d.setFullYear(d.getFullYear() + 1);
      return d.toISOString().split('T')[0];
    } catch {
      return '2027-10-15';
    }
  };

  const [newEndDate, setNewEndDate] = useState<string>(computeNextYearDate(lease.endDate));
  const [newRent, setNewRent] = useState<number>(lease.rentAmount);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    renewLease(lease.id, newEndDate, Number(newRent));
    setSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">
              {language === 'FR' ? 'Renouveler le contrat de bail' : 'Renew Lease Contract'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              {language === 'FR' ? 'Bail renouvelé avec succès !' : 'Lease Successfully Renewed!'}
            </h4>
            <p className="text-sm text-slate-600">
              Nouveau terme fixé au <span className="font-semibold">{formatDateFR(newEndDate)}</span> avec un loyer de <span className="font-semibold">{formatFCFA(newRent)}</span>.
            </p>

            {tenant && property && (
              <a
                href={buildWhatsAppLink(
                  tenant.whatsappNumber || tenant.phone,
                  `Bonjour M./Mme ${tenant.fullName},\n\nNous vous confirmons le renouvellement de votre bail pour le logement (*${property.title}*) jusqu'au *${formatDateFR(newEndDate)}*.\nNouveau loyer mensuel : *${formatFCFA(newRent)}*.\n\nMerci de votre confiance,\n— *${agencyProfile.name}*`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Envoyer confirmation WhatsApp au locataire</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Current summary */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80 text-xs space-y-1.5">
              <p>
                <span className="text-slate-500">Logement : </span>
                <span className="font-bold text-slate-900">{property?.title}</span>
              </p>
              <p>
                <span className="text-slate-500">Locataire : </span>
                <span className="font-semibold text-slate-800">{tenant?.fullName} ({tenant?.phone})</span>
              </p>
              <p>
                <span className="text-slate-500">Échéance actuelle : </span>
                <span className="font-mono font-bold text-rose-700">{formatDateFR(lease.endDate)}</span>
              </p>
              <p>
                <span className="text-slate-500">Loyer actuel : </span>
                <span className="font-mono font-bold text-slate-900">{formatFCFA(lease.rentAmount)}</span>
              </p>
            </div>

            {/* New End Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'FR' ? 'Nouvelle date d\'échéance du bail' : 'New Lease Expiry Date'}
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            {/* New Rent amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'FR' ? 'Loyer mensuel révisé (FCFA)' : 'Revised Monthly Rent (FCFA)'}
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={newRent}
                  onChange={(e) => setNewRent(Number(e.target.value))}
                  required
                  min="1"
                  step="5000"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Laissez inchangé pour conserver le loyer précédent ({formatFCFA(lease.rentAmount)}).
              </p>
            </div>

            {/* Submit buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
              >
                Valider le renouvellement
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
