import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Phone, 
  Share2, 
  Calendar, 
  CreditCard, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  X,
  ExternalLink,
  Shield,
  Briefcase
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Tenant, Payment } from '../../types';
import { formatFCFA, formatDateFR, buildWhatsAppLink, getLateRentWhatsAppMessage } from '../../utils/formatters';

interface TenantsViewProps {
  onOpenNewTenant: () => void;
  onOpenRecordPayment: (propertyId?: string, tenantId?: string) => void;
  onOpenRentReceipt: (payment: Payment) => void;
}

export const TenantsView: React.FC<TenantsViewProps> = ({
  onOpenNewTenant,
  onOpenRecordPayment,
  onOpenRentReceipt,
}) => {
  const { 
    tenants, 
    properties, 
    leases, 
    payments, 
    currentMonthYear, 
    agencyProfile, 
    searchQuery,
    language 
  } = useApp();

  const [selectedTenantDetail, setSelectedTenantDetail] = useState<Tenant | null>(null);

  // Filter tenants
  const filteredTenants = tenants.filter((t) => {
    return (
      t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.profession.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {language === 'FR' ? 'Gestion des Locataires' : 'Tenants Directory'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {filteredTenants.length} {language === 'FR' ? 'locataires actifs enregistrés' : 'active tenants registered'}
          </p>
        </div>

        <button
          onClick={onOpenNewTenant}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{language === 'FR' ? 'Nouveau locataire' : 'New Tenant'}</span>
        </button>
      </div>

      {/* Tenants Table / Cards List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3">Locataire & Contact</th>
                <th className="px-5 py-3">Bien Rattaché</th>
                <th className="px-5 py-3">Loyer Mensuel</th>
                <th className="px-5 py-3">Statut Règlement ({currentMonthYear})</th>
                <th className="px-5 py-3">Fin de Bail</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map((t) => {
                const property = properties.find((p) => p.id === t.currentPropertyId);
                const lease = leases.find((l) => l.tenantId === t.id && l.status !== 'terminated');
                const currentPayment = payments.find(
                  (p) => p.tenantId === t.id && p.monthYear === currentMonthYear
                );

                const isPaid = currentPayment?.status === 'paid';
                const isLate = currentPayment?.status === 'late';

                return (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Name & Phone */}
                    <td className="px-5 py-4">
                      <div 
                        onClick={() => setSelectedTenantDetail(t)}
                        className="cursor-pointer group"
                      >
                        <p className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                          {t.fullName}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{t.phone}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{t.profession}</p>
                      </div>
                    </td>

                    {/* Property */}
                    <td className="px-5 py-4">
                      {property ? (
                        <div>
                          <p className="font-semibold text-slate-800 line-clamp-1">{property.title}</p>
                          <p className="text-[11px] text-slate-500">{property.commune}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Non affecté</span>
                      )}
                    </td>

                    {/* Rent */}
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      {property ? formatFCFA(property.rentAmount) : '-'}
                    </td>

                    {/* Payment Status Timeline for Current Month */}
                    <td className="px-5 py-4">
                      {isPaid ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Réglé ({formatDateFR(currentPayment?.datePaid)})</span>
                        </div>
                      ) : isLate ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-800 rounded font-bold text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>En retard ({formatFCFA(currentPayment?.amount || property?.rentAmount)})</span>
                        </div>
                      ) : (
                        <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-[11px]">
                          En attente d'échéance
                        </span>
                      )}
                    </td>

                    {/* Lease End Date */}
                    <td className="px-5 py-4 font-mono text-slate-700">
                      {lease ? formatDateFR(lease.endDate) : '-'}
                    </td>

                    {/* Action buttons */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* WhatsApp one-tap */}
                        {isLate && property ? (
                          <a
                            href={buildWhatsAppLink(
                              t.whatsappNumber || t.phone,
                              getLateRentWhatsAppMessage({
                                tenantName: t.fullName,
                                propertyTitle: property.title,
                                monthYear: currentMonthYear,
                                amountFCFA: currentPayment?.amount || property.rentAmount,
                                agencyName: agencyProfile.name,
                              })
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded transition-colors"
                            title="Relancer par WhatsApp"
                          >
                            <Share2 className="w-4 h-4" />
                          </a>
                        ) : (
                          <a
                            href={buildWhatsAppLink(
                              t.whatsappNumber || t.phone,
                              `Bonjour M./Mme ${t.fullName},\n\nNous restons à votre disposition pour toute question relative à votre logement (*${property?.title || 'géré'}*).\n\n— *${agencyProfile.name}*`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                            title="Discuter sur WhatsApp"
                          >
                            <Share2 className="w-4 h-4" />
                          </a>
                        )}

                        {/* Record rent shortcut */}
                        {!isPaid && property && (
                          <button
                            onClick={() => onOpenRecordPayment(property.id, t.id)}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold transition-colors"
                          >
                            Encaisser
                          </button>
                        )}

                        {/* View Quittance if paid */}
                        {isPaid && currentPayment && (
                          <button
                            onClick={() => onOpenRentReceipt(currentPayment)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
                          >
                            Quittance
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedTenantDetail(t)}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded text-[11px] font-medium border border-slate-200"
                        >
                          Fiche
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Detailed Dossier Modal */}
      {selectedTenantDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400">
                  Dossier Locataire
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedTenantDetail.fullName}</h3>
                <p className="text-xs text-slate-400">{selectedTenantDetail.profession}</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={buildWhatsAppLink(
                    selectedTenantDetail.whatsappNumber || selectedTenantDetail.phone,
                    `Bonjour M./Mme ${selectedTenantDetail.fullName},\n\n— *${agencyProfile.name}*`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <button
                  onClick={() => setSelectedTenantDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Identity & Emergency Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Pièce d'Identité</span>
                  <p className="font-bold text-slate-900">{selectedTenantDetail.idDocumentType}</p>
                  <p className="font-mono text-slate-600">{selectedTenantDetail.idDocumentNumber}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Contact d'Urgence</span>
                  <p className="font-bold text-slate-900">{selectedTenantDetail.emergencyContact}</p>
                  <p className="font-mono text-slate-600">{selectedTenantDetail.emergencyPhone}</p>
                </div>
              </div>

              {/* Payment History Table */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-slate-700 text-xs flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Historique des versements de loyer</span>
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 uppercase text-slate-600 border-b border-slate-200 text-[10px]">
                      <tr>
                        <th className="px-3 py-2">Mois</th>
                        <th className="px-3 py-2">Montant</th>
                        <th className="px-3 py-2">Date Règlement</th>
                        <th className="px-3 py-2">Mode</th>
                        <th className="px-3 py-2 text-right">Quittance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments
                        .filter((p) => p.tenantId === selectedTenantDetail.id)
                        .map((p) => (
                          <tr key={p.id}>
                            <td className="px-3 py-2 font-medium text-slate-900">{p.monthYear}</td>
                            <td className="px-3 py-2 font-mono font-bold text-slate-900">{formatFCFA(p.amount)}</td>
                            <td className="px-3 py-2 text-slate-600">{formatDateFR(p.datePaid)}</td>
                            <td className="px-3 py-2 font-mono uppercase text-slate-500 text-[10px]">
                              {p.paymentMethod || 'Non spécifié'}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {p.status === 'paid' && (
                                <button
                                  onClick={() => {
                                    setSelectedTenantDetail(null);
                                    onOpenRentReceipt(p);
                                  }}
                                  className="text-amber-700 hover:text-amber-900 font-semibold"
                                >
                                  Imprimer &rarr;
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
