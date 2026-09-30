import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  List, 
  Map as MapIcon, 
  Plus, 
  Home, 
  User, 
  Calendar, 
  CreditCard, 
  Wrench, 
  X, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Droplet,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Property, PropertyStatus, PropertyType, BamakoCommune } from '../../types';
import { formatFCFA, formatDateFR } from '../../utils/formatters';

interface PropertiesViewProps {
  onOpenNewProperty: () => void;
  onOpenRecordPayment: (propertyId?: string) => void;
  onOpenLogMaintenance: (propertyId?: string) => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  onOpenNewProperty,
  onOpenRecordPayment,
  onOpenLogMaintenance,
}) => {
  const { 
    properties, 
    tenants, 
    owners, 
    leases, 
    payments, 
    maintenance, 
    searchQuery,
    language 
  } = useApp();

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [communeFilter, setCommuneFilter] = useState<string>('all');
  const [activePropertyDetail, setActivePropertyDetail] = useState<Property | null>(null);

  // Filter properties
  const filteredProperties = properties.filter((p) => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.commune.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    const matchesCommune = communeFilter === 'all' || p.commune === communeFilter;
    return matchesSearch && matchesStatus && matchesType && matchesCommune;
  });

  // Unique communes
  const uniqueCommunes = Array.from(new Set(properties.map((p) => p.commune)));

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {language === 'FR' ? 'Parc Immobilier à Bamako' : 'Properties Portfolio'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {filteredProperties.length} {language === 'FR' ? 'biens sous mandat de gestion' : 'properties managed'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* List vs Map segmented control */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/60 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-slate-900 shadow-xs font-semibold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{language === 'FR' ? 'Liste' : 'List'}</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'map' 
                  ? 'bg-white text-slate-900 shadow-xs font-semibold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{language === 'FR' ? 'Plan Bamako' : 'Bamako Map'}</span>
            </button>
          </div>

          <button
            onClick={onOpenNewProperty}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'FR' ? 'Ajouter un bien' : 'Add Property'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {[
            { id: 'all', label: language === 'FR' ? 'Tous' : 'All' },
            { id: 'occupied', label: language === 'FR' ? 'Occupés' : 'Occupied' },
            { id: 'vacant', label: language === 'FR' ? 'Vacants' : 'Vacant' },
            { id: 'maintenance', label: language === 'FR' ? 'En travaux' : 'In Work' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Commune Filter */}
        <select
          value={communeFilter}
          onChange={(e) => setCommuneFilter(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
        >
          <option value="all">Toutes les communes</option>
          {uniqueCommunes.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
        >
          <option value="all">Tous les types de biens</option>
          <option value="villa">Villas</option>
          <option value="appartement">Appartements</option>
          <option value="duplex">Duplex</option>
          <option value="commercial">Commerces</option>
          <option value="immeuble">Immeubles</option>
        </select>
      </div>

      {/* Main Content Area */}
      {viewMode === 'list' ? (
        /* Property Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => {
            const owner = owners.find((o) => o.id === prop.ownerId);
            const tenant = tenants.find((t) => t.id === prop.currentTenantId);
            const lease = leases.find((l) => l.id === prop.currentLeaseId);

            return (
              <div
                key={prop.id}
                onClick={() => setActivePropertyDetail(prop)}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Photo & Status Badge */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={prop.photos[0]}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                      {prop.type}
                    </div>
                    <div className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded tracking-wider ${
                      prop.status === 'occupied' 
                        ? 'bg-emerald-600 text-white' 
                        : prop.status === 'vacant' 
                        ? 'bg-amber-500 text-slate-950 font-extrabold'
                        : 'bg-slate-700 text-white'
                    }`}>
                      {prop.status === 'occupied' ? 'Occupé' : prop.status === 'vacant' ? 'Vacant' : 'En travaux'}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {formatFCFA(prop.rentAmount)}
                      </span>
                      <span className="text-[10px] text-slate-300">/ mois</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1 group-hover:text-amber-700 transition-colors">
                        {prop.title}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{prop.commune} · {prop.address}</span>
                      </p>
                    </div>

                    {/* Metadata Specs (No pills - clean unboxed typography) */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <span>{prop.bedrooms > 0 ? `${prop.bedrooms} ch.` : 'Espace ouvert'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{prop.bathrooms} sdb.</span>
                      <span aria-hidden="true">·</span>
                      <span>{prop.surfaceArea} m²</span>
                    </div>

                    {/* Occupancy and Owner status */}
                    <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Bailleur :</span>
                        <span className="font-medium text-slate-800 truncate max-w-[150px]">{owner?.fullName}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Locataire :</span>
                        <span className="font-semibold text-slate-900 truncate max-w-[150px]">
                          {tenant ? tenant.fullName : <span className="text-amber-700 italic">Aucun (Disponible)</span>}
                        </span>
                      </div>
                      {lease && (
                        <div className="flex items-center justify-between text-slate-500 text-[11px]">
                          <span>Fin de bail :</span>
                          <span className="font-mono">{formatDateFR(lease.endDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="text-[11px] text-slate-400 font-mono">Commission : {prop.agencyCommissionRate}%</span>
                  <span className="font-semibold text-amber-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Historique complet</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Interactive Bamako Map View / District Grid */
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">
              Cartographie Immobilière du District de Bamako
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sélectionnez un quartier pour visualiser les biens gérés sur les rives Gauche et Droite du Fleuve Niger.
            </p>
          </div>

          {/* Stylized Bamako Geography Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rive Gauche (North of Niger River) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Rive Gauche (Centre d'Affaires & Administratif)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Communes II, III, IV</span>
              </div>
              <div className="space-y-2">
                {['ACI 2000', 'Hamdallaye ACI', 'Hippodrome', 'Korofina', 'Sotuba'].map((commune) => {
                  const commProps = properties.filter((p) => p.commune === commune);
                  return (
                    <div
                      key={commune}
                      onClick={() => setCommuneFilter(commune)}
                      className="p-3 bg-white rounded-lg border border-slate-200 hover:border-amber-500 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{commune}</p>
                        <p className="text-[11px] text-slate-500">
                          {commProps.length} {commProps.length > 1 ? 'biens gérés' : 'bien géré'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-amber-700">
                          {formatFCFA(commProps.reduce((s, p) => s + p.rentAmount, 0))}
                        </span>
                        <span className="block text-[10px] text-slate-400">/ mois</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rive Droite (South of Niger River) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Rive Droite (Résidentiel & Ambassades)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Communes V, VI</span>
              </div>
              <div className="space-y-2">
                {['Badalabougou', 'Bacodjicoroni Golf', 'Yirimadio', 'Sébénikoro'].map((commune) => {
                  const commProps = properties.filter((p) => p.commune === commune);
                  return (
                    <div
                      key={commune}
                      onClick={() => setCommuneFilter(commune)}
                      className="p-3 bg-white rounded-lg border border-slate-200 hover:border-amber-500 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{commune}</p>
                        <p className="text-[11px] text-slate-500">
                          {commProps.length} {commProps.length > 1 ? 'biens gérés' : 'bien géré'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-amber-700">
                          {formatFCFA(commProps.reduce((s, p) => s + p.rentAmount, 0))}
                        </span>
                        <span className="block text-[10px] text-slate-400">/ mois</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Detail Drawer / Modal (Click into property -> full history) */}
      {activePropertyDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl border border-slate-200 overflow-hidden my-6">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400">
                  Dossier Technique & Historique
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{activePropertyDetail.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activePropertyDetail.commune} · {activePropertyDetail.address}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const id = activePropertyDetail.id;
                    setActivePropertyDetail(null);
                    onOpenRecordPayment(id);
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold"
                >
                  Encaisser Loyer
                </button>
                <button
                  onClick={() => {
                    const id = activePropertyDetail.id;
                    setActivePropertyDetail(null);
                    onOpenLogMaintenance(id);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold border border-slate-700"
                >
                  Intervention
                </button>
                <button
                  onClick={() => setActivePropertyDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Photo gallery thumbnails */}
              <div className="grid grid-cols-3 gap-3">
                {activePropertyDetail.photos.map((url, i) => (
                  <div key={i} className="h-32 rounded-lg overflow-hidden bg-slate-100">
                    <img src={url} alt={`Vue ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              {/* Core Attributes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400">Loyer Mensuel</span>
                  <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    {formatFCFA(activePropertyDetail.rentAmount)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Dépôt de Garantie</span>
                  <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    {formatFCFA(activePropertyDetail.cautionAmount)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Statut du Bien</span>
                  <p className="text-sm font-bold text-emerald-700 mt-1 capitalize">
                    {activePropertyDetail.status === 'occupied' ? 'Occupé' : 'Vacant'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Commission Agence</span>
                  <p className="text-sm font-bold text-slate-900 mt-1 font-mono">
                    {activePropertyDetail.agencyCommissionRate}%
                  </p>
                </div>
              </div>

              {/* Utilities & Technical Information (EDM ISAGO, Solar Borehole) */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-700 text-[10px] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  Compteurs & Équipements Techniques
                </span>
                <p className="text-slate-700 font-medium">{activePropertyDetail.utilitiesInfo}</p>
                <div className="pt-2 flex flex-wrap gap-2">
                  {activePropertyDetail.amenities.map((am, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[11px]">
                      ✓ {am}
                    </span>
                  ))}
                </div>
              </div>

              {/* Full History 1: Payments History */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Historique des Paiements de Loyer</span>
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 uppercase text-slate-600 border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="px-3 py-2">Mois</th>
                        <th className="px-3 py-2">Montant</th>
                        <th className="px-3 py-2">Date Règlement</th>
                        <th className="px-3 py-2">Mode & Réf</th>
                        <th className="px-3 py-2 text-right">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments
                        .filter((p) => p.propertyId === activePropertyDetail.id)
                        .map((p) => (
                          <tr key={p.id}>
                            <td className="px-3 py-2 font-medium text-slate-900">{p.monthYear}</td>
                            <td className="px-3 py-2 font-mono font-bold text-slate-800">{formatFCFA(p.amount)}</td>
                            <td className="px-3 py-2 text-slate-600">{formatDateFR(p.datePaid)}</td>
                            <td className="px-3 py-2 text-slate-500 font-mono text-[11px]">
                              {p.paymentMethod?.toUpperCase()} {p.transactionRef ? `(${p.transactionRef})` : ''}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {p.status === 'paid' ? 'Payé' : 'En retard'}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Full History 2: Maintenance & Repairs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <span>Historique des Travaux & Réparations</span>
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 uppercase text-slate-600 border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="px-3 py-2">Intervention</th>
                        <th className="px-3 py-2">Artisan</th>
                        <th className="px-3 py-2">Coût (FCFA)</th>
                        <th className="px-3 py-2 text-right">Déduction Propriétaire</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {maintenance
                        .filter((m) => m.propertyId === activePropertyDetail.id)
                        .map((m) => (
                          <tr key={m.id}>
                            <td className="px-3 py-2">
                              <p className="font-medium text-slate-800">{m.title}</p>
                              <span className="text-[10px] text-slate-400">{formatDateFR(m.reportedDate)}</span>
                            </td>
                            <td className="px-3 py-2 text-slate-600">{m.artisanName}</td>
                            <td className="px-3 py-2 font-mono font-bold text-slate-900">{formatFCFA(m.cost)}</td>
                            <td className="px-3 py-2 text-right text-[11px]">
                              {m.deductFromOwnerPayout ? (
                                <span className="text-amber-700 font-semibold">✓ Déduit sur relevé</span>
                              ) : (
                                <span className="text-slate-400">Non déduit</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      {maintenance.filter((m) => m.propertyId === activePropertyDetail.id).length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-3 text-center text-slate-400 italic">
                            Aucune réparation enregistrée pour ce bien.
                          </td>
                        </tr>
                      )}
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
