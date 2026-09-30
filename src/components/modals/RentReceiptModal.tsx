import React from 'react';
import { X, Printer, Share2, Building2, CheckCircle2 } from 'lucide-react';
import { Payment, Property, Tenant, Owner } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  formatFCFA, 
  formatDateFR, 
  formatMonthYearFR, 
  numberToFrenchWords, 
  buildWhatsAppLink, 
  getRentReceiptWhatsAppMessage 
} from '../../utils/formatters';

interface RentReceiptModalProps {
  payment: Payment | null;
  onClose: () => void;
}

export const RentReceiptModal: React.FC<RentReceiptModalProps> = ({ payment, onClose }) => {
  const { agencyProfile, properties, tenants, owners, language } = useApp();

  if (!payment) return null;

  const property = properties.find((p) => p.id === payment.propertyId);
  const tenant = tenants.find((t) => t.id === payment.tenantId);
  const owner = owners.find((o) => o.id === payment.ownerId || (property && o.id === property.ownerId));

  const handlePrint = () => {
    window.print();
  };

  const paymentMethodLabel = {
    orange_money: 'Orange Money Mali',
    wave: 'Wave Mali',
    moov_money: 'Moov Money',
    bank_transfer: 'Virement bancaire',
    cash: 'Espèces contre reçu',
  }[payment.paymentMethod || 'cash'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Controls (No print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Quittance Officielle de Loyer</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>
            {tenant && property && (
              <a
                href={buildWhatsAppLink(
                  tenant.whatsappNumber || tenant.phone,
                  getRentReceiptWhatsAppMessage({
                    tenantName: tenant.fullName,
                    propertyTitle: property.title,
                    monthYear: payment.monthYear,
                    amountFCFA: payment.amount,
                    receiptNumber: payment.receiptNumber,
                    agencyName: agencyProfile.name,
                  })
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-8 space-y-6 text-slate-800">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {agencyProfile.name}
              </h2>
              <p className="text-xs text-slate-500 italic mt-0.5">{agencyProfile.slogan}</p>
              <p className="text-xs text-slate-600 mt-2">{agencyProfile.address}</p>
              <p className="text-xs text-slate-600">
                Tél : {agencyProfile.phone} · Bamako, Mali
              </p>
              <p className="text-[11px] font-mono text-slate-500 mt-1">
                RCCM : {agencyProfile.rccm} · NIF : {agencyProfile.nif}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 rounded text-xs font-bold text-amber-900 uppercase tracking-wider">
                Quittance de Loyer
              </span>
              <p className="text-xs font-mono text-slate-700 mt-2">
                N° : <span className="font-bold">{payment.receiptNumber}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Date : {formatDateFR(payment.datePaid || new Date().toISOString())}
              </p>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs">
            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                Bailleur / Propriétaire
              </p>
              <p className="font-semibold text-slate-900 text-sm">{owner?.fullName || 'Propriétaire Mandant'}</p>
              <p className="text-slate-600 mt-0.5">Représenté par : {agencyProfile.name}</p>
            </div>

            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                Locataire Preneur
              </p>
              <p className="font-semibold text-slate-900 text-sm">{tenant?.fullName || 'Locataire'}</p>
              <p className="text-slate-600 mt-0.5">Tél : {tenant?.phone || '-'}</p>
              {tenant?.idDocumentNumber && (
                <p className="text-slate-500 text-[11px]">
                  Pièce : {tenant.idDocumentType} N° {tenant.idDocumentNumber}
                </p>
              )}
            </div>
          </div>

          {/* Property & Rent Terms */}
          <div className="border border-slate-200 rounded-lg overflow-hidden text-sm">
            <div className="bg-slate-100/70 px-4 py-2 border-b border-slate-200 font-semibold text-slate-800 text-xs uppercase tracking-wide">
              Désignation du bien loué
            </div>
            <div className="p-4 space-y-2">
              <p className="font-bold text-slate-900 text-base">{property?.title}</p>
              <p className="text-slate-600 text-xs">
                Adresse : {property?.address} — Commune : {property?.commune}, Bamako
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600">Période de loyer acquittée :</span>
                <span className="font-bold text-slate-900">
                  Mois de {formatMonthYearFR(payment.monthYear)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="border border-slate-200 rounded-lg overflow-hidden text-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-100/70 text-xs text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Description</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                <tr>
                  <td className="px-4 py-3">
                    Loyer principal pour {formatMonthYearFR(payment.monthYear)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    {formatFCFA(payment.amount)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-slate-500">Charges d'entretien / Gardiennage</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-500">Incluses</td>
                </tr>
                <tr className="bg-slate-50 font-bold text-sm">
                  <td className="px-4 py-3 text-slate-900">Total Loyer Perçu</td>
                  <td className="px-4 py-3 text-right font-mono text-amber-700 text-base">
                    {formatFCFA(payment.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount in French Words & Mode */}
          <div className="text-xs space-y-1.5 bg-amber-50/50 p-3.5 rounded border border-amber-200/60">
            <p>
              <span className="text-slate-500">Arrêté la présente quittance à la somme de : </span>
              <span className="font-bold text-slate-900 italic">
                {numberToFrenchWords(payment.amount)}
              </span>
            </p>
            <p>
              <span className="text-slate-500">Règlement effectué par : </span>
              <span className="font-semibold text-slate-800">{paymentMethodLabel}</span>
              {payment.transactionRef && (
                <span className="font-mono text-slate-600"> (Réf : {payment.transactionRef})</span>
              )}
            </p>
          </div>

          {/* Signatures & Stamp */}
          <div className="pt-6 grid grid-cols-2 gap-8 border-t border-slate-200 text-xs">
            <div>
              <p className="font-semibold text-slate-700 mb-12">Le Locataire</p>
              <p className="text-[11px] text-slate-400 italic">Mention "Pour acquit"</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-700 mb-2">Pour l'Agence Mandataire</p>
              <div className="inline-block border-2 border-dashed border-slate-300 rounded p-4 text-center">
                <p className="font-bold text-slate-800 text-[11px]">{agencyProfile.name}</p>
                <p className="text-[10px] text-emerald-700 font-bold uppercase mt-1 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Quittance Validée
                </p>
                <p className="text-[9px] text-slate-400 font-mono mt-1">Bamako · Mali</p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center pt-2">
            La présente quittance annule tout reçu antérieur pour le même terme et n'emporte pas renonciation aux clauses du bail en cours.
          </p>
        </div>
      </div>
    </div>
  );
};
