import React, { useState } from 'react';
import { X, Wrench, DollarSign, CheckSquare, Square } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MaintenanceCategory, MaintenanceStatus } from '../../types';
import { formatFCFA } from '../../utils/formatters';

interface LogMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPropertyId?: string;
}

export const LogMaintenanceModal: React.FC<LogMaintenanceModalProps> = ({
  isOpen,
  onClose,
  preselectedPropertyId,
}) => {
  const { properties, logMaintenance, language } = useApp();

  const [propertyId, setPropertyId] = useState<string>(
    preselectedPropertyId || (properties[0]?.id || '')
  );
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MaintenanceCategory>('climatisation');
  const [cost, setCost] = useState<number>(35000);
  const [artisanName, setArtisanName] = useState('');
  const [artisanPhone, setArtisanPhone] = useState('+223 ');
  const [status, setStatus] = useState<MaintenanceStatus>('completed');
  const [deductFromOwnerPayout, setDeductFromOwnerPayout] = useState<boolean>(true);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !title || cost <= 0) return;

    const prop = properties.find((p) => p.id === propertyId);

    logMaintenance({
      propertyId,
      ownerId: prop?.ownerId || 'owner-1',
      title,
      category,
      cost: Number(cost),
      completedDate: status === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
      status,
      artisanName: artisanName || 'Artisan mandaté agence',
      artisanPhone: artisanPhone || '+223 70 00 00 00',
      deductFromOwnerPayout,
      notes: notes || undefined,
    });

    onClose();
  };

  const selectedProp = properties.find((p) => p.id === propertyId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden my-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {language === 'FR' ? 'Enregistrer une intervention de maintenance' : 'Log Maintenance / Repair'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'FR' 
                ? 'Suivi des travaux et imputation sur relevé propriétaire' 
                : 'Track repairs and deduct from owner statement'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bien immobilier concerné
            </label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.commune})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catégorie de travaux
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
              >
                <option value="climatisation">Climatisation</option>
                <option value="plomberie">Plomberie</option>
                <option value="electricite">Électricité</option>
                <option value="forage">Forage / Surpresseur</option>
                <option value="groupe_electrogene">Groupe électrogène</option>
                <option value="peinture">Peinture & Façade</option>
                <option value="menuiserie">Menuiserie & Serrures</option>
                <option value="autre">Autre intervention</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Statut de l'intervention
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
              >
                <option value="completed">Terminé & Facturé</option>
                <option value="in_progress">En cours de réalisation</option>
                <option value="reported">Signalé (En attente devis)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description de la panne ou intervention
            </label>
            <input
              type="text"
              required
              placeholder="ex: Révision filtre et recharge gaz climatiseur salon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Coût total des réparations (FCFA)
            </label>
            <input
              type="number"
              required
              min="1000"
              step="1000"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nom artisan / Société</label>
              <input
                type="text"
                placeholder="ex: Atelier Frigo Bamako"
                value={artisanName}
                onChange={(e) => setArtisanName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tél Artisan (Mali)</label>
              <input
                type="text"
                placeholder="+223 76 00 00 00"
                value={artisanPhone}
                onChange={(e) => setArtisanPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Deduct from Owner Payout Toggle */}
          <div 
            onClick={() => setDeductFromOwnerPayout(!deductFromOwnerPayout)}
            className={`p-3.5 rounded-lg border cursor-pointer transition-colors flex items-start gap-3 ${
              deductFromOwnerPayout 
                ? 'bg-amber-50 border-amber-300 text-amber-900' 
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className="mt-0.5">
              {deductFromOwnerPayout ? (
                <CheckSquare className="w-4 h-4 text-amber-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <div className="text-xs">
              <span className="font-bold">Déduire du reversement mensuel du propriétaire</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Cette dépense ({formatFCFA(cost)}) sera automatiquement soustraite du prochain relevé de compte édité pour le bailleur.
              </p>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
            >
              Enregistrer l'intervention
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
