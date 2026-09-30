import React from 'react';
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Share2, 
  Wrench, 
  CreditCard, 
  Users, 
  MapPin,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatFCFA, formatDateFR, buildWhatsAppLink, getLateRentWhatsAppMessage } from '../../utils/formatters';

interface DashboardViewProps {
  onOpenRecordPayment: () => void;
  onOpenNewProperty: () => void;
  onOpenNewTenant: () => void;
  onOpenLogMaintenance: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenRecordPayment,
  onOpenNewProperty,
  onOpenNewTenant,
  onOpenLogMaintenance,
}) => {
  const { 
    properties, 
    tenants, 
    payments, 
    leases, 
    maintenance, 
    activities, 
    occupancyRate, 
    collectionRate, 
    overdueCount, 
    totalExpectedRent, 
    totalCollectedRent, 
    totalAgencyCommission, 
    agencyProfile,
    currentMonthYear,
    setActiveTab,
    setSelectedPropertyId,
    language 
  } = useApp();

  // Find overdue payments for immediate action
  const latePayments = payments.filter((p) => p.monthYear === currentMonthYear && p.status === 'late');

  // Expiring leases
  const expiringLeases = leases.filter((l) => l.status === 'expiring_soon');

  // Neighborhood stats
  const communeCounts = properties.reduce<Record<string, number>>((acc, p) => {
    acc[p.commune] = (acc[p.commune] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Top Banner: Calm Editorial Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {language === 'FR' ? 'Gestion Locative — Bamako' : 'Property Management — Bamako'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {agencyProfile.name} · Période en cours : <span className="font-semibold text-slate-700">Septembre 2026</span>
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenRecordPayment}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{language === 'FR' ? 'Encaisser Loyer' : 'Record Rent'}</span>
          </button>
          <button
            onClick={onOpenLogMaintenance}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'FR' ? 'Intervention' : 'Maintenance'}</span>
          </button>
          <button
            onClick={onOpenNewProperty}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'FR' ? 'Nouveau Bien' : 'New Property'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Row: Calm, Elegant, Readable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Occupancy Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>{language === 'FR' ? 'Taux d\'occupation' : 'Occupancy Rate'}</span>
            <span className="text-emerald-700 font-medium">
              {properties.filter((p) => p.status === 'occupied').length}/{properties.length} {language === 'FR' ? 'biens' : 'units'}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {occupancyRate}%
          </div>
          <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {properties.filter((p) => p.status === 'vacant').length} {language === 'FR' ? 'bien disponible à la location' : 'vacant unit'}
          </p>
        </div>

        {/* KPI 2: Collection Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>{language === 'FR' ? 'Taux de recouvrement' : 'Collection Rate'}</span>
            <span className="text-amber-800 font-medium">Ce mois</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {collectionRate}%
          </div>
          <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-amber-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${collectionRate}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            {formatFCFA(totalCollectedRent)} / {formatFCFA(totalExpectedRent)}
          </p>
        </div>

        {/* KPI 3: Overdue Count */}
        <div className={`p-5 rounded-xl border shadow-xs flex flex-col justify-between transition-colors ${
          overdueCount > 0 
            ? 'bg-amber-50/50 border-amber-200' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className={overdueCount > 0 ? 'text-amber-900 font-semibold' : 'text-slate-500'}>
              {language === 'FR' ? 'Loyers en retard' : 'Overdue Rents'}
            </span>
            {overdueCount > 0 && (
              <span className="text-amber-800 text-[11px] font-bold">Action requise</span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-mono tracking-tight ${overdueCount > 0 ? 'text-amber-900' : 'text-slate-900'}`}>
              {overdueCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {language === 'FR' ? (overdueCount > 1 ? 'locataires' : 'locataire') : 'tenant'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 flex items-center justify-between">
            <span>Relance en 1 clic</span>
            <button
              onClick={() => setActiveTab('notifications')}
              className="text-amber-700 hover:text-amber-900 font-semibold hover:underline"
            >
              Voir détails &rarr;
            </button>
          </p>
        </div>

        {/* KPI 4: Total Agency Commission */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>{language === 'FR' ? 'Honoraires agence encaissés' : 'Agency Fees Earned'}</span>
            <span className="text-emerald-700 font-medium">Moyenne 10%</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
            {formatFCFA(totalAgencyCommission)}
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Volume total géré :</span>
            <span className="font-mono text-slate-600">{formatFCFA(totalExpectedRent)}</span>
          </div>
        </div>
      </div>

      {/* Immediate Attention Callout: Overdue Tenant Banner with 1-Tap WhatsApp */}
      {latePayments.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-900 rounded-lg mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'FR' ? 'Relance loyer impayé en attente' : 'Overdue Rent Pending'}
                </h3>
                {latePayments.map((lp) => {
                  const prop = properties.find((p) => p.id === lp.propertyId);
                  const tenant = tenants.find((t) => t.id === lp.tenantId);
                  return (
                    <div key={lp.id} className="mt-2 text-xs text-slate-700 space-y-1">
                      <p>
                        Locataire : <span className="font-semibold text-slate-900">{tenant?.fullName}</span> ({tenant?.phone})
                        {' · '}Bien : <span className="font-semibold text-slate-900">{prop?.title}</span>
                      </p>
                      <p>
                        Montant dû : <span className="font-mono font-bold text-rose-700">{formatFCFA(lp.amount)}</span>
                        {' · '}Échéance dépassée du <span className="font-semibold">{formatDateFR(lp.dueDate)}</span>
                      </p>
                      <div className="pt-2 flex items-center gap-3">
                        {tenant && prop && (
                          <a
                            href={buildWhatsAppLink(
                              tenant.whatsappNumber || tenant.phone,
                              getLateRentWhatsAppMessage({
                                tenantName: tenant.fullName,
                                propertyTitle: prop.title,
                                monthYear: lp.monthYear,
                                amountFCFA: lp.amount,
                                agencyName: agencyProfile.name,
                                orangeMoneyNumber: agencyProfile.orangeMoneyMerchant,
                              })
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition-colors"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Envoyer relance WhatsApp en 1 clic</span>
                          </a>
                        )}
                        <button
                          onClick={onOpenRecordPayment}
                          className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium"
                        >
                          Enregistrer encaissement
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Activity Feed & Neighborhood Portfolio Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'FR' ? 'Activité récente de l\'agence' : 'Recent Agency Activity'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'FR' ? 'Historique chronologique des opérations' : 'Chronological operational log'}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('payments')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900"
            >
              {language === 'FR' ? 'Voir tout' : 'View all'} &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {activities.slice(0, 5).map((act) => (
              <div key={act.id} className="py-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                  {act.type === 'payment' && <CreditCard className="w-4 h-4 text-emerald-600" />}
                  {act.type === 'maintenance' && <Wrench className="w-4 h-4 text-amber-600" />}
                  {act.type === 'lease' && <Clock className="w-4 h-4 text-blue-600" />}
                  {act.type === 'property' && <Building2 className="w-4 h-4 text-purple-600" />}
                  {act.type === 'tenant' && <Users className="w-4 h-4 text-slate-600" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-800 truncate">{act.title}</p>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      {act.timestamp.split(' ')[1] || act.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Bamako Neighborhood Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'FR' ? 'Répartition par Quartier' : 'Bamako Districts'}
            </h3>
            <p className="text-xs text-slate-500">
              Portefeuille d'actifs par commune de Bamako
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(communeCounts).map(([commune, count]) => {
              const percentage = Math.round((count / properties.length) * 100);
              return (
                <div key={commune} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {commune}
                    </span>
                    <span className="font-mono text-slate-500">
                      {count} {count > 1 ? 'biens' : 'bien'} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-600 h-full rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('properties')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold text-center transition-colors border border-slate-200"
            >
              Ouvrir la cartographie des biens &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
