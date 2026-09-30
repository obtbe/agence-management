import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Share2, 
  CheckCircle2, 
  X,
  Building,
  User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Lease } from '../../types';
import { formatFCFA, formatDateFR, getDaysRemaining, buildWhatsAppLink, getLeaseExpiringWhatsAppMessage } from '../../utils/formatters';

interface LeasesViewProps {
  onOpenRenewLease: (lease: Lease) => void;
}

export const LeasesView: React.FC<LeasesViewProps> = ({ onOpenRenewLease }) => {
  const { 
    leases, 
    properties, 
    tenants, 
    owners, 
    addLease, 
    agencyProfile,
    searchQuery,
    language 
  } = useApp();

  const [isAddLeaseOpen, setIsAddLeaseOpen] = useState(false);
  const [propertyId, setPropertyId] = useState(properties[0]?.id || '');
  const [tenantId, setTenantId] = useState(tenants[0]?.id || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2027-09-30');
  const [rentAmount, setRentAmount] = useState(500000);
  const [cautionMonths, setCautionMonths] = useState(3);
  const [cautionAmount, setCautionAmount] = useState(1500000);
  const [termsNotes, setTermsNotes] = useState('Bail d\'habitation standard à usage résidentiel.');

  const handlePropertyChange = (pId: string) => {
    setPropertyId(pId);
    const prop = properties.find((p) => p.id === pId);
    if (prop) {
      setRentAmount(prop.rentAmount);
      setCautionAmount(prop.rentAmount * cautionMonths);
    }
  };

  const handleCreateLease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !tenantId) return;

    const prop = properties.find((p) => p.id === propertyId);

    addLease({
      propertyId,
      tenantId,
      ownerId: prop?.ownerId || 'owner-1',
      startDate,
      endDate,
      rentAmount: Number(rentAmount),
      cautionMonths: Number(cautionMonths),
      cautionAmount: Number(cautionAmount),
      paymentDueDay: 5,
      status: 'active',
      termsNotes,
    });

    setIsAddLeaseOpen(false);
  };

  const filteredLeases = leases.filter((l) => {
    const prop = properties.find((p) => p.id === l.propertyId);
    const tenant = tenants.find((t) => t.id === l.tenantId);
    return (
      (prop?.title.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (tenant?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {language === 'FR' ? 'Gestion des Baux & Contrats de Location' : 'Leases & Rental Agreements'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {filteredLeases.length} {language === 'FR' ? 'baux sous surveillance active' : 'leases actively tracked'}
          </p>
        </div>

        <button
          onClick={() => setIsAddLeaseOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{language === 'FR' ? 'Nouveau contrat de bail' : 'New Lease'}</span>
        </button>
      </div>

      {/* Leases Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3">Bien Immobilier</th>
                <th className="px-5 py-3">Locataire Preneur</th>
                <th className="px-5 py-3">Date de Début</th>
                <th className="px-5 py-3">Date d'Échéance</th>
                <th className="px-5 py-3">Loyer & Caution</th>
                <th className="px-5 py-3">État du Bail</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeases.map((lease) => {
                const prop = properties.find((p) => p.id === lease.propertyId);
                const tenant = tenants.find((t) => t.id === lease.tenantId);
                const daysRemaining = getDaysRemaining(lease.endDate);
                const isExpiringSoon = daysRemaining <= 60 && daysRemaining > 0;
                const isExpired = daysRemaining <= 0;

                return (
                  <tr key={lease.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{prop?.title}</p>
                      <p className="text-[11px] text-slate-500">{prop?.commune} · {prop?.address}</p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{tenant?.fullName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{tenant?.phone}</p>
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-600">
                      {formatDateFR(lease.startDate)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-slate-900 block">
                        {formatDateFR(lease.endDate)}
                      </span>
                      {isExpiringSoon && (
                        <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
                          Expire dans {daysRemaining} jours
                        </span>
                      )}
                      {isExpired && (
                        <span className="text-[10px] text-rose-700 font-bold block mt-0.5">
                          Terme échu
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-mono font-bold text-slate-900">{formatFCFA(lease.rentAmount)}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Caution : {formatFCFA(lease.cautionAmount)} ({lease.cautionMonths} mois)
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {isExpiringSoon ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded font-bold text-[11px]">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Échéance proche
                        </span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-800 rounded font-bold text-[11px]">
                          Expiré
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded font-semibold text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Actif
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* WhatsApp lease renewal message */}
                        {tenant && prop && (
                          <a
                            href={buildWhatsAppLink(
                              tenant.whatsappNumber || tenant.phone,
                              getLeaseExpiringWhatsAppMessage({
                                tenantName: tenant.fullName,
                                propertyTitle: prop.title,
                                endDate: lease.endDate,
                                daysRemaining: Math.max(1, daysRemaining),
                                agencyName: agencyProfile.name,
                              })
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                            title="Proposer renouvellement par WhatsApp"
                          >
                            <Share2 className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          onClick={() => onOpenRenewLease(lease)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors"
                        >
                          <RefreshCw className="w-3 h-3 text-amber-400" />
                          <span>Renouveler</span>
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

      {/* Add Lease Modal */}
      {isAddLeaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">Établir un Nouveau Contrat de Bail</h3>
              <button onClick={() => setIsAddLeaseOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLease} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bien Immobilier</label>
                <select
                  value={propertyId}
                  onChange={(e) => handlePropertyChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.commune}) — {formatFCFA(p.rentAmount)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Locataire Preneur</label>
                <select
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date d'entrée en jouissance</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date de fin (Terme)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Loyer Mensuel (FCFA)</label>
                  <input
                    type="number"
                    value={rentAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setRentAmount(val);
                      setCautionAmount(val * cautionMonths);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Caution (3 mois standard)</label>
                  <input
                    type="number"
                    value={cautionAmount}
                    onChange={(e) => setCautionAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddLeaseOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
                >
                  Signer et Activer le Bail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
