import React, { useState } from 'react';
import { X, Printer, Share2, Building2, Download, AlertCircle, Wrench, ArrowDownRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  formatFCFA, 
  formatDateFR, 
  formatMonthYearFR, 
  buildWhatsAppLink 
} from '../../utils/formatters';

interface OwnerStatementModalProps {
  ownerId: string;
  initialMonthYear?: string;
  onClose: () => void;
}

export const OwnerStatementModal: React.FC<OwnerStatementModalProps> = ({
  ownerId,
  initialMonthYear = '2026-09',
  onClose,
}) => {
  const { getOwnerStatement, agencyProfile, language } = useApp();
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonthYear);

  const statement = getOwnerStatement(ownerId, selectedMonth);
  const { owner, grossRent, commissionRate, commissionAmount, maintenanceCost, netPayout, payments, maintenanceItems, properties } = statement;

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = `Bonjour M./Mme ${owner.fullName},

Voici le relevé de gestion locative pour le mois de *${formatMonthYearFR(selectedMonth)}* :

🏢 Biens gérés : ${properties.length}
💰 Loyers bruts encaissés : *${formatFCFA(grossRent)}*
📉 Commission agence (${commissionRate}%) : -${formatFCFA(commissionAmount)}
🔧 Déductions travaux & maintenance : -${formatFCFA(maintenanceCost)}
────────────────────────
✅ *NET À REVERSER : ${formatFCFA(netPayout)}*

Mode de versement prévu : ${owner.payoutDetails}

Le relevé détaillé officiel est disponible à l'agence.

Bien cordialement,
— *${agencyProfile.name}*`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Controls */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-sm">
              Relevé de Gestion Propriétaire · {owner.fullName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded border border-slate-700 focus:outline-none"
            />
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>
            <a
              href={buildWhatsAppLink(owner.whatsappNumber || owner.phone, whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Statement Body */}
        <div className="p-8 space-y-6 text-slate-800">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {agencyProfile.name}
              </h2>
              <p className="text-xs text-slate-500 italic">{agencyProfile.slogan}</p>
              <p className="text-xs text-slate-600 mt-2">{agencyProfile.address}</p>
              <p className="text-xs text-slate-600">
                Tél : {agencyProfile.phone} · Bamako
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white rounded text-xs font-bold uppercase tracking-wider">
                Relevé de Compte Mensuel
              </span>
              <p className="text-sm font-bold text-slate-900 mt-2">
                Période : {formatMonthYearFR(selectedMonth)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Édité le {formatDateFR(new Date().toISOString())}
              </p>
            </div>
          </div>

          {/* Owner details banner */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500">Bailleur Mandant</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">{owner.fullName}</p>
              <p className="text-slate-600 mt-0.5">Tél : {owner.phone}</p>
              <p className="text-slate-500">{owner.address}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500">Coordonnées de Versement</p>
              <p className="text-xs font-mono font-bold text-slate-800 mt-1 bg-white p-2 rounded border border-slate-200">
                {owner.payoutDetails}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Taux de commission agence : <span className="font-semibold">{commissionRate}%</span>
              </p>
            </div>
          </div>

          {/* Table: Rents Collected */}
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
              1. Loyers Bruts Encaissés
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100/70 uppercase text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Bien Immobilier</th>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Mode / Réf</th>
                    <th className="px-4 py-2.5 text-right">Montant Encaissé</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.length > 0 ? (
                    payments.map((p) => {
                      const prop = properties.find((pr) => pr.id === p.propertyId);
                      return (
                        <tr key={p.id}>
                          <td className="px-4 py-2.5 font-medium text-slate-800">
                            {prop?.title || 'Bien géré'}
                            <span className="block text-[11px] text-slate-500 font-normal">
                              Commune : {prop?.commune}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">{formatDateFR(p.datePaid)}</td>
                          <td className="px-4 py-2.5 font-mono text-slate-600 text-[11px]">
                            {p.paymentMethod?.toUpperCase()} · {p.transactionRef || '-'}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                            {formatFCFA(p.amount)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-slate-400 italic">
                        Aucun encaissement validé pour ce mois.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-slate-800">Sous-total Loyers Bruts</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-900">
                      {formatFCFA(grossRent)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Table: Deductions (Agency commission + Maintenance repairs) */}
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
              2. Déductions & Dépenses Justifiées
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100/70 uppercase text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Nature de la déduction</th>
                    <th className="px-4 py-2.5">Détails / Artisan</th>
                    <th className="px-4 py-2.5 text-right">Montant Déduit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Agency Fee */}
                  <tr>
                    <td className="px-4 py-2.5 font-medium text-slate-800">
                      Honoraires de gestion agence ({commissionRate}%)
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">
                      Gestion locative, recouvrement et suivi
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-rose-700 font-semibold">
                      - {formatFCFA(commissionAmount)}
                    </td>
                  </tr>

                  {/* Maintenance items deducted */}
                  {maintenanceItems.map((m) => {
                    const prop = properties.find((pr) => pr.id === m.propertyId);
                    return (
                      <tr key={m.id}>
                        <td className="px-4 py-2.5 font-medium text-slate-800">
                          {m.title}
                          <span className="block text-[11px] text-slate-500 font-normal">
                            Bien : {prop?.title}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 text-[11px]">
                          Artisan : {m.artisanName} ({m.artisanPhone})
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-rose-700 font-semibold">
                          - {formatFCFA(m.cost)}
                        </td>
                      </tr>
                    );
                  })}

                  {maintenanceItems.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-slate-400 italic">
                        Aucun frais de réparation déductible ce mois-ci.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={2} className="px-4 py-2 text-slate-800">Total des Déductions</td>
                    <td className="px-4 py-2 text-right font-mono text-rose-700">
                      - {formatFCFA(commissionAmount + maintenanceCost)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* NET Payout Summary Card */}
          <div className="p-5 rounded-xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-extrabold text-amber-900 tracking-wider">
                Solde Net à Reverser au Propriétaire
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                Virement sur compte : <span className="font-mono font-medium">{owner.payoutDetails}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-amber-900">
                {formatFCFA(netPayout)}
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-8 border-t border-slate-200 text-xs">
            <div>
              <p className="font-semibold text-slate-700 mb-10">Le Propriétaire Mandant</p>
              <p className="text-[11px] text-slate-400">Lu et approuvé</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-700 mb-2">La Direction de l'Agence</p>
              <p className="text-xs font-bold text-slate-800">{agencyProfile.name}</p>
              <p className="text-[10px] text-slate-500">Bamako, Mali</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
