import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Share2, 
  Phone, 
  DollarSign, 
  Building,
  CheckSquare,
  Square
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Maintenance, MaintenanceCategory } from '../../types';
import { formatFCFA, formatDateFR, buildWhatsAppLink, getMaintenanceVisitWhatsAppMessage } from '../../utils/formatters';

interface MaintenanceViewProps {
  onOpenLogMaintenance: (propertyId?: string) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({ onOpenLogMaintenance }) => {
  const { 
    maintenance, 
    properties, 
    tenants, 
    owners, 
    updateMaintenance, 
    agencyProfile, 
    searchQuery,
    language 
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredMaintenance = maintenance.filter((m) => {
    const prop = properties.find((p) => p.id === m.propertyId);
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.artisanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prop?.title.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalCosts = maintenance.reduce((sum, m) => sum + m.cost, 0);
  const totalDeducted = maintenance
    .filter((m) => m.deductFromOwnerPayout)
    .reduce((sum, m) => sum + m.cost, 0);

  const toggleDeduction = (id: string, currentVal: boolean) => {
    updateMaintenance(id, { deductFromOwnerPayout: !currentVal });
  };

  const markCompleted = (id: string) => {
    updateMaintenance(id, {
      status: 'completed',
      completedDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {language === 'FR' ? 'Maintenance, Travaux & Réparations' : 'Maintenance & Repairs'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'FR' 
              ? 'Suivi des artisans de Bamako & déductions automatiques sur reversements propriétaires' 
              : 'Track Bamako contractors & auto-deduct from owner payouts'}
          </p>
        </div>

        <button
          onClick={() => onOpenLogMaintenance()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{language === 'FR' ? 'Enregistrer une intervention' : 'Log Repair'}</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block mb-1">Total Réparations Engagées</span>
          <span className="text-2xl font-extrabold font-mono text-slate-900">
            {formatFCFA(totalCosts)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            {maintenance.length} interventions techniques enregistrées
          </span>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl shadow-xs">
          <span className="text-amber-900 font-semibold block mb-1">Déduit des Revers. Propriétaires</span>
          <span className="text-2xl font-extrabold font-mono text-amber-900">
            {formatFCFA(totalDeducted)}
          </span>
          <span className="text-[11px] text-amber-800 block mt-1">
            Déduction automatique répercutée sur les comptes de gestion
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block mb-1">Interventions en Cours</span>
          <span className="text-2xl font-extrabold font-mono text-slate-900">
            {maintenance.filter((m) => m.status === 'in_progress').length}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            {maintenance.filter((m) => m.status === 'completed').length} clôturées avec succès
          </span>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs w-fit">
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'climatisation', label: 'Climatisation' },
          { id: 'groupe_electrogene', label: 'Groupe électrogène' },
          { id: 'plomberie', label: 'Plomberie' },
          { id: 'forage', label: 'Forage' },
          { id: 'peinture', label: 'Peinture' },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryFilter(c.id)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              categoryFilter === c.id ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Maintenance Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3">Intervention & Description</th>
                <th className="px-5 py-3">Bien Immobilier</th>
                <th className="px-5 py-3">Artisan & Contact</th>
                <th className="px-5 py-3">Coût (FCFA)</th>
                <th className="px-5 py-3">Imputation Propriétaire</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaintenance.map((m) => {
                const prop = properties.find((p) => p.id === m.propertyId);
                const tenant = tenants.find((t) => t.id === prop?.currentTenantId);

                return (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Title & Date */}
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-bold text-slate-900">{m.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Signalé le {formatDateFR(m.reportedDate)}
                        {m.completedDate ? ` · Clôturé le ${formatDateFR(m.completedDate)}` : ''}
                      </p>
                    </td>

                    {/* Property */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{prop?.title}</p>
                      <p className="text-[11px] text-slate-500">{prop?.commune}</p>
                    </td>

                    {/* Artisan */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{m.artisanName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{m.artisanPhone}</p>
                    </td>

                    {/* Cost */}
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      {formatFCFA(m.cost)}
                    </td>

                    {/* Deduct from Owner Toggle */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleDeduction(m.id, m.deductFromOwnerPayout)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                          m.deductFromOwnerPayout
                            ? 'bg-amber-50 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                        title="Cliquer pour basculer l'imputation au propriétaire"
                      >
                        {m.deductFromOwnerPayout ? (
                          <CheckSquare className="w-3.5 h-3.5 text-amber-700" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>{m.deductFromOwnerPayout ? 'Déduit du relevé' : 'Charge agence'}</span>
                      </button>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {m.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded font-semibold text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Terminé
                        </span>
                      ) : m.status === 'in_progress' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 rounded font-semibold text-[11px]">
                          <Clock className="w-3 h-3 text-blue-600" />
                          En cours
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-[11px]">
                          Signalé
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* WhatsApp notify tenant */}
                        {tenant && prop && (
                          <a
                            href={buildWhatsAppLink(
                              tenant.whatsappNumber || tenant.phone,
                              getMaintenanceVisitWhatsAppMessage({
                                tenantName: tenant.fullName,
                                propertyTitle: prop.title,
                                issueTitle: m.title,
                                artisanName: m.artisanName,
                                artisanPhone: m.artisanPhone,
                                dateStr: formatDateFR(m.completedDate || m.reportedDate),
                                agencyName: agencyProfile.name,
                              })
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                            title="Avertir le locataire par WhatsApp"
                          >
                            <Share2 className="w-4 h-4" />
                          </a>
                        )}

                        {m.status !== 'completed' && (
                          <button
                            onClick={() => markCompleted(m.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold"
                          >
                            Clôturer
                          </button>
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
