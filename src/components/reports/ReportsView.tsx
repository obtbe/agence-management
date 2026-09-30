import React, { useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  Printer, 
  Download, 
  Building2, 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign, 
  Share2,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  formatFCFA, 
  formatDateFR, 
  formatMonthYearFR, 
  buildWhatsAppLink 
} from '../../utils/formatters';

interface ReportsViewProps {
  onOpenOwnerStatement: (ownerId: string, monthYear?: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onOpenOwnerStatement }) => {
  const { 
    properties, 
    owners, 
    payments, 
    maintenance, 
    occupancyRate, 
    collectionRate, 
    totalExpectedRent, 
    totalCollectedRent, 
    totalAgencyCommission, 
    agencyProfile, 
    currentMonthYear,
    getOwnerStatement,
    language 
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthYear);

  // Month-specific calculations
  const monthPayments = payments.filter((p) => p.monthYear === selectedMonth && p.status === 'paid');
  const monthGross = monthPayments.reduce((s, p) => s + p.amount, 0);

  const monthMaintenance = maintenance
    .filter((m) => m.reportedDate.startsWith(selectedMonth) && m.deductFromOwnerPayout)
    .reduce((s, m) => s + m.cost, 0);

  const monthCommissions = monthPayments.reduce((s, p) => {
    const prop = properties.find((pr) => pr.id === p.propertyId);
    const rate = prop?.agencyCommissionRate || 10;
    return s + (p.amount * rate) / 100;
  }, 0);

  const monthNetPayoutsTotal = Math.max(0, monthGross - monthCommissions - monthMaintenance);

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['Réf Quittance', 'Bien', 'Commune', 'Locataire', 'Montant (FCFA)', 'Mode', 'Date Règlement'],
      ...monthPayments.map((p) => {
        const prop = properties.find((pr) => pr.id === p.propertyId);
        const tenant = properties.find((pr) => pr.id === p.propertyId);
        return [
          p.receiptNumber,
          prop?.title || '',
          prop?.commune || '',
          p.tenantId,
          p.amount.toString(),
          p.paymentMethod || '',
          p.datePaid || '',
        ];
      }),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `soba_bamako_rapport_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {language === 'FR' ? 'Rapports Financiers & Relevés de Compte' : 'Financial Reports & Statements'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'FR' 
              ? 'Synthèse des encaissements, honoraires agence et décomptes propriétaires' 
              : 'Collection summary, agency fees and owner balances'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
          />

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer Synthèse</span>
          </button>
        </div>
      </div>

      {/* Agency Performance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block mb-1">Loyers Bruts Encaissés</span>
          <span className="text-2xl font-extrabold font-mono text-slate-900">
            {formatFCFA(monthGross)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-2">
            Période : {formatMonthYearFR(selectedMonth)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block mb-1">Honoraires Agence Encaissés</span>
          <span className="text-2xl font-extrabold font-mono text-emerald-800">
            {formatFCFA(monthCommissions)}
          </span>
          <span className="text-[11px] text-emerald-700 block mt-2 font-medium">
            Taux moyen appliqué : 10%
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block mb-1">Frais de Réparations Déduits</span>
          <span className="text-2xl font-extrabold font-mono text-rose-700">
            -{formatFCFA(monthMaintenance)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-2">
            Déduits sur quittances artisans
          </span>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-xl shadow-xs">
          <span className="text-amber-900 font-bold block mb-1">Total Net Reversé Propriétaires</span>
          <span className="text-2xl font-extrabold font-mono text-amber-900">
            {formatFCFA(monthNetPayoutsTotal)}
          </span>
          <span className="text-[11px] text-amber-800 block mt-2 font-medium">
            Prêt pour virement bancaire / OM
          </span>
        </div>
      </div>

      {/* Owner Statements Hub */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Relevés de Compte Propriétaires — {formatMonthYearFR(selectedMonth)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Générez, visualisez et transmettez instantanément le relevé mensuel à chaque bailleur mandant.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 uppercase text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Bailleur Mandant</th>
                <th className="px-4 py-2.5">Biens Gérés</th>
                <th className="px-4 py-2.5">Loyers Bruts</th>
                <th className="px-4 py-2.5">Commission Agence</th>
                <th className="px-4 py-2.5">Travaux Déduits</th>
                <th className="px-4 py-2.5">Net à Reverser</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {owners.map((owner) => {
                const statement = getOwnerStatement(owner.id, selectedMonth);
                return (
                  <tr key={owner.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900">{owner.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{owner.phone}</p>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {statement.properties.length} {statement.properties.length > 1 ? 'biens' : 'bien'}
                    </td>

                    <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                      {formatFCFA(statement.grossRent)}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      -{formatFCFA(statement.commissionAmount)} ({statement.commissionRate}%)
                    </td>

                    <td className="px-4 py-3.5 font-mono text-rose-700">
                      {statement.maintenanceCost > 0 ? `-${formatFCFA(statement.maintenanceCost)}` : '0 FCFA'}
                    </td>

                    <td className="px-4 py-3.5 font-mono font-extrabold text-amber-900 text-sm">
                      {formatFCFA(statement.netPayout)}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenOwnerStatement(owner.id, selectedMonth)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>Relevé PDF</span>
                        </button>

                        <a
                          href={buildWhatsAppLink(
                            owner.whatsappNumber || owner.phone,
                            `Bonjour M./Mme ${owner.fullName},\n\nVotre relevé de gestion du mois de *${formatMonthYearFR(selectedMonth)}* est prêt.\nNet à vous reverser : *${formatFCFA(statement.netPayout)}*.\n\n— *${agencyProfile.name}*`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                          title="Partager par WhatsApp"
                        >
                          <Share2 className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
