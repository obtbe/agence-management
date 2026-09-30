import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  Printer, 
  Calendar, 
  Search,
  ArrowDownLeft,
  Smartphone,
  Building
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Payment, PaymentStatus } from '../../types';
import { 
  formatFCFA, 
  formatDateFR, 
  formatMonthYearFR, 
  buildWhatsAppLink, 
  getRentReceiptWhatsAppMessage,
  getLateRentWhatsAppMessage 
} from '../../utils/formatters';

interface PaymentsViewProps {
  onOpenRecordPayment: () => void;
  onOpenRentReceipt: (payment: Payment) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  onOpenRecordPayment,
  onOpenRentReceipt,
}) => {
  const { 
    payments, 
    properties, 
    tenants, 
    currentMonthYear, 
    agencyProfile,
    searchQuery,
    language 
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthYear);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'late'>('all');

  // Filter payments
  const monthPayments = payments.filter((p) => p.monthYear === selectedMonth);

  const filteredPayments = monthPayments.filter((p) => {
    const prop = properties.find((pr) => pr.id === p.propertyId);
    const tenant = tenants.find((t) => t.id === p.tenantId);

    const matchesSearch =
      (prop?.title.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (tenant?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (p.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCollectedMonth = monthPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOverdueMonth = monthPayments
    .filter((p) => p.status === 'late')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {language === 'FR' ? 'Registre des Paiements & Loyers' : 'Rent Payments Register'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'FR' 
              ? 'Enregistrement direct sans intermédiaire · Quittances immédiates' 
              : 'Direct recording · Instant rent receipts'}
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
            onClick={onOpenRecordPayment}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'FR' ? 'Encaisser un loyer' : 'Record Payment'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards for Selected Month */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block mb-1">Total Encaissé ({formatMonthYearFR(selectedMonth)})</span>
          <span className="text-2xl font-extrabold font-mono text-emerald-800">
            {formatFCFA(totalCollectedMonth)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            {monthPayments.filter((p) => p.status === 'paid').length} quittances validées
          </span>
        </div>

        <div className={`p-4 rounded-xl border shadow-xs ${
          totalOverdueMonth > 0 ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'
        }`}>
          <span className="text-slate-400 block mb-1">Montant en Retard</span>
          <span className={`text-2xl font-extrabold font-mono ${totalOverdueMonth > 0 ? 'text-amber-900' : 'text-slate-900'}`}>
            {formatFCFA(totalOverdueMonth)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            {monthPayments.filter((p) => p.status === 'late').length} locataires en attente de régularisation
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block mb-1">Modes de Versement Réceptionnés</span>
          <div className="flex items-center gap-2 mt-2 font-mono text-[11px] text-slate-700">
            <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded font-semibold">Orange Money</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">Wave</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">BDM</span>
          </div>
        </div>
      </div>

      {/* Filter Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs w-fit">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tous les paiements ({monthPayments.length})
        </button>
        <button
          onClick={() => setStatusFilter('paid')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            statusFilter === 'paid' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Encaissés ({monthPayments.filter((p) => p.status === 'paid').length})
        </button>
        <button
          onClick={() => setStatusFilter('late')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            statusFilter === 'late' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          En retard ({monthPayments.filter((p) => p.status === 'late').length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3">Quittance / Réf</th>
                <th className="px-5 py-3">Bien Loué</th>
                <th className="px-5 py-3">Locataire</th>
                <th className="px-5 py-3">Montant</th>
                <th className="px-5 py-3">Mode & Réf Tx</th>
                <th className="px-5 py-3">Date Paiement</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => {
                const prop = properties.find((pr) => pr.id === p.propertyId);
                const tenant = tenants.find((t) => t.id === p.tenantId);
                const isPaid = p.status === 'paid';

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-900">
                      {p.receiptNumber}
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900">{prop?.title}</p>
                      <p className="text-[11px] text-slate-500">{prop?.commune}</p>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{tenant?.fullName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{tenant?.phone}</p>
                    </td>

                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {formatFCFA(p.amount)}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-medium text-slate-800 uppercase text-[11px]">
                        {p.paymentMethod?.replace('_', ' ') || '-'}
                      </span>
                      {p.transactionRef && (
                        <span className="block font-mono text-[10px] text-slate-400">
                          {p.transactionRef}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">
                      {p.datePaid ? formatDateFR(p.datePaid) : <span className="text-slate-400 italic">Échéance {formatDateFR(p.dueDate)}</span>}
                    </td>

                    <td className="px-5 py-3.5">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Payé
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-50 px-2 py-0.5 rounded font-bold text-[11px]">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          En retard
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isPaid ? (
                          <>
                            <button
                              onClick={() => onOpenRentReceipt(p)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] transition-colors"
                              title="Afficher et imprimer la quittance"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Quittance</span>
                            </button>

                            {tenant && prop && (
                              <a
                                href={buildWhatsAppLink(
                                  tenant.whatsappNumber || tenant.phone,
                                  getRentReceiptWhatsAppMessage({
                                    tenantName: tenant.fullName,
                                    propertyTitle: prop.title,
                                    monthYear: p.monthYear,
                                    amountFCFA: p.amount,
                                    receiptNumber: p.receiptNumber,
                                    agencyName: agencyProfile.name,
                                  })
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Envoyer quittance par WhatsApp"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </>
                        ) : (
                          <>
                            <button
                              onClick={onOpenRecordPayment}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold text-[11px]"
                            >
                              Encaisser
                            </button>

                            {tenant && prop && (
                              <a
                                href={buildWhatsAppLink(
                                  tenant.whatsappNumber || tenant.phone,
                                  getLateRentWhatsAppMessage({
                                    tenantName: tenant.fullName,
                                    propertyTitle: prop.title,
                                    monthYear: p.monthYear,
                                    amountFCFA: p.amount,
                                    agencyName: agencyProfile.name,
                                  })
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded"
                                title="Relancer par WhatsApp"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </>
                        )}
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
