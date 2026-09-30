import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  Share2, 
  CreditCard, 
  RefreshCw, 
  CheckCircle2, 
  Phone,
  MessageCircle,
  Building
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  formatFCFA, 
  formatDateFR, 
  getDaysRemaining, 
  buildWhatsAppLink, 
  getLateRentWhatsAppMessage,
  getLeaseExpiringWhatsAppMessage 
} from '../../utils/formatters';

interface NotificationsViewProps {
  onOpenRecordPayment: (propertyId?: string, tenantId?: string) => void;
  onOpenRenewLease: (lease: any) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onOpenRecordPayment,
  onOpenRenewLease,
}) => {
  const { 
    payments, 
    leases, 
    properties, 
    tenants, 
    currentMonthYear, 
    agencyProfile,
    language 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'overdue' | 'leases'>('all');

  // Overdue rents
  const latePayments = payments.filter((p) => p.monthYear === currentMonthYear && p.status === 'late');

  // Expiring leases (< 60 days)
  const expiringLeases = leases.filter((l) => {
    const days = getDaysRemaining(l.endDate);
    return days <= 60 && l.status !== 'terminated';
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {language === 'FR' ? 'Centre de Relances & Alertes WhatsApp' : 'Alerts & WhatsApp Hub'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'FR' 
              ? 'Envoi de messages types en 1 clic pour loyers en retard et renouvellements de baux' 
              : 'One-tap WhatsApp automated messaging for late rents and expiring leases'}
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Toutes ({latePayments.length + expiringLeases.length})
          </button>
          <button
            onClick={() => setActiveFilter('overdue')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeFilter === 'overdue' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Loyers en retard ({latePayments.length})
          </button>
          <button
            onClick={() => setActiveFilter('leases')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeFilter === 'leases' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Échéances de baux ({expiringLeases.length})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {/* Section 1: Overdue Rents */}
        {(activeFilter === 'all' || activeFilter === 'overdue') && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Loyers Impayés ou en Retard de Règlement</span>
            </h3>

            {latePayments.length > 0 ? (
              latePayments.map((p) => {
                const prop = properties.find((pr) => pr.id === p.propertyId);
                const tenant = tenants.find((t) => t.id === p.tenantId);

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl border border-amber-300/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-800 rounded font-bold text-[10px] uppercase">
                          Retard de paiement
                        </span>
                        <span className="text-xs text-slate-400">Échéance : {formatDateFR(p.dueDate)}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">
                        {tenant?.fullName} — {prop?.title}
                      </h4>

                      <p className="text-xs text-slate-600">
                        Montant dû : <span className="font-mono font-bold text-rose-700 text-sm">{formatFCFA(p.amount)}</span>
                        {' · '}Commune : <span className="font-medium text-slate-800">{prop?.commune}</span>
                        {' · '}Tél : <span className="font-mono">{tenant?.phone}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
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
                              orangeMoneyNumber: agencyProfile.orangeMoneyMerchant,
                            })
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Relancer sur WhatsApp</span>
                        </a>
                      )}

                      <button
                        onClick={() => onOpenRecordPayment(p.propertyId, p.tenantId)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium"
                      >
                        Encaisser
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400 italic">
                Aucun retard de loyer à signaler pour ce mois.
              </div>
            )}
          </div>
        )}

        {/* Section 2: Expiring Leases */}
        {(activeFilter === 'all' || activeFilter === 'leases') && (
          <div className="space-y-3 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Contrats de Bail Arrivant à Échéance (&lt; 60 jours)</span>
            </h3>

            {expiringLeases.length > 0 ? (
              expiringLeases.map((l) => {
                const prop = properties.find((pr) => pr.id === l.propertyId);
                const tenant = tenants.find((t) => t.id === l.tenantId);
                const daysRemaining = getDaysRemaining(l.endDate);

                return (
                  <div
                    key={l.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-bold text-[10px] uppercase">
                          Échéance dans {daysRemaining} jours
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          Date fin : {formatDateFR(l.endDate)}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">
                        {tenant?.fullName} — {prop?.title}
                      </h4>

                      <p className="text-xs text-slate-600">
                        Loyer actuel : <span className="font-mono font-bold text-slate-900">{formatFCFA(l.rentAmount)}</span>
                        {' · '}Tél : <span className="font-mono">{tenant?.phone}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {tenant && prop && (
                        <a
                          href={buildWhatsAppLink(
                            tenant.whatsappNumber || tenant.phone,
                            getLeaseExpiringWhatsAppMessage({
                              tenantName: tenant.fullName,
                              propertyTitle: prop.title,
                              endDate: l.endDate,
                              daysRemaining: Math.max(1, daysRemaining),
                              agencyName: agencyProfile.name,
                            })
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Proposer renouvellement WhatsApp</span>
                        </a>
                      )}

                      <button
                        onClick={() => onOpenRenewLease(l)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium"
                      >
                        Renouveler le bail
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400 italic">
                Aucun bail n'arrive à échéance dans les 60 prochains jours.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
