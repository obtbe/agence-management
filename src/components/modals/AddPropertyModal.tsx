import React, { useState } from 'react';
import { X, Building, Home, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PropertyType, BamakoCommune, PropertyStatus } from '../../types';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ isOpen, onClose }) => {
  const { addProperty, owners, language } = useApp();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<PropertyType>('villa');
  const [commune, setCommune] = useState<BamakoCommune>('ACI 2000');
  const [address, setAddress] = useState('');
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [surfaceArea, setSurfaceArea] = useState(200);
  const [rentAmount, setRentAmount] = useState(500000);
  const [cautionAmount, setCautionAmount] = useState(1500000);
  const [ownerId, setOwnerId] = useState(owners[0]?.id || '');
  const [status, setStatus] = useState<PropertyStatus>('vacant');
  const [utilitiesInfo, setUtilitiesInfo] = useState('Compteur EDM ISAGO + Forage solaire');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || rentAmount <= 0) return;

    // High quality architectural photo presets based on type
    const photoPresets: Record<PropertyType, string[]> = {
      villa: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
      ],
      appartement: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
      ],
      duplex: [
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80'
      ],
      commercial: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
      ],
      immeuble: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
      ]
    };

    addProperty({
      title,
      type,
      commune,
      address: address || `${commune}, Bamako`,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      surfaceArea: Number(surfaceArea),
      rentAmount: Number(rentAmount),
      cautionAmount: Number(cautionAmount),
      agencyCommissionRate: 10,
      status,
      ownerId: ownerId || owners[0]?.id || 'owner-1',
      photos: photoPresets[type] || photoPresets.villa,
      amenities: ['Climatisation split', 'Guérite gardien', 'Forage avec suppresseur', 'Accès goudron'],
      utilitiesInfo: utilitiesInfo || 'Compteur ISAGO + Forage',
      description: description || `Bien immobilier de standing à ${commune}, Bamako.`,
    });

    onClose();
  };

  const handleRentChange = (value: number) => {
    setRentAmount(value);
    setCautionAmount(value * 3); // 3 months caution standard
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl border border-slate-200 overflow-hidden my-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {language === 'FR' ? 'Ajouter un nouveau bien immobilier' : 'Add New Property'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'FR' ? 'Intégration au portefeuille de gestion' : 'Add to agency portfolio'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Désignation du bien (Titre)
            </label>
            <input
              type="text"
              required
              placeholder="ex: Villa R+1 Contemporaine avec Cour"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type de bien
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PropertyType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="villa">Villa</option>
                <option value="appartement">Appartement</option>
                <option value="duplex">Duplex</option>
                <option value="commercial">Local Commercial</option>
                <option value="immeuble">Immeuble entier</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quartier / Commune à Bamako
              </label>
              <select
                value={commune}
                onChange={(e) => setCommune(e.target.value as BamakoCommune)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="ACI 2000">ACI 2000</option>
                <option value="Badalabougou">Badalabougou</option>
                <option value="Hamdallaye ACI">Hamdallaye ACI</option>
                <option value="Hippodrome">Hippodrome</option>
                <option value="Bacodjicoroni Golf">Bacodjicoroni Golf</option>
                <option value="Yirimadio">Yirimadio</option>
                <option value="Korofina">Korofina</option>
                <option value="Sotuba">Sotuba</option>
                <option value="Sébénikoro">Sébénikoro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Adresse précise / Repères
            </label>
            <input
              type="text"
              placeholder="ex: Rue 312, face Clinique Pasteur"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Rent & Caution */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loyer Mensuel (FCFA)
              </label>
              <input
                type="number"
                required
                min="10000"
                step="5000"
                value={rentAmount}
                onChange={(e) => handleRentChange(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Caution (FCFA)
              </label>
              <input
                type="number"
                value={cautionAmount}
                onChange={(e) => setCautionAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* Rooms & Area */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chambres</label>
              <input
                type="number"
                min="0"
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Salles de bain</label>
              <input
                type="number"
                min="0"
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Surface (m²)</label>
              <input
                type="number"
                min="10"
                value={surfaceArea}
                onChange={(e) => setSurfaceArea(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Owner & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bailleur propriétaire
              </label>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
              >
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Statut initial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
              >
                <option value="vacant">Vacant (Disponible)</option>
                <option value="occupied">Occupé</option>
                <option value="maintenance">En travaux / Rénovation</option>
                <option value="reserved">Réservé</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Équipements & Eau / Électricité (EDM ISAGO, Forage...)
            </label>
            <input
              type="text"
              value={utilitiesInfo}
              onChange={(e) => setUtilitiesInfo(e.target.value)}
              placeholder="ex: Compteur ISAGO individuel + Forage solaire 5000L"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
            />
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
              Créer le bien immobilier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
