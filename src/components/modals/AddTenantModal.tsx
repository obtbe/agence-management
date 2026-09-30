import React, { useState } from 'react';
import { X, UserPlus, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IdDocumentType } from '../../types';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTenantModal: React.FC<AddTenantModalProps> = ({ isOpen, onClose }) => {
  const { addTenant, properties, addLease, language } = useApp();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+223 ');
  const [whatsappNumber, setWhatsappNumber] = useState('+223 ');
  const [email, setEmail] = useState('');
  const [profession, setProfession] = useState('');
  const [idDocumentType, setIdDocumentType] = useState<IdDocumentType>('NINA');
  const [idDocumentNumber, setIdDocumentNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('+223 ');
  const [assignedPropertyId, setAssignedPropertyId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    addTenant({
      fullName,
      phone,
      whatsappNumber: whatsappNumber || phone,
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@client.ml`,
      profession,
      idDocumentType,
      idDocumentNumber: idDocumentNumber || 'NINA-EN-COURS',
      emergencyContact,
      emergencyPhone,
      currentPropertyId: assignedPropertyId || undefined,
      status: 'active',
      notes: 'Nouveau locataire enregistré à l\'agence.',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden my-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {language === 'FR' ? 'Enregistrer un nouveau locataire' : 'Register New Tenant'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'FR' ? 'Fiche d\'identification & coordonnées' : 'Tenant identification & contacts'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nom complet du locataire
            </label>
            <input
              type="text"
              required
              placeholder="ex: M. Souleymane Keïta"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Téléphone principal (Mali)
              </label>
              <input
                type="text"
                required
                placeholder="+223 76 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Numéro WhatsApp
              </label>
              <input
                type="text"
                placeholder="+223 76 00 00 00"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="contact@exemple.ml"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Profession</label>
              <input
                type="text"
                placeholder="ex: Ingénieur Télécom, Avocat..."
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pièce d'identité</label>
              <select
                value={idDocumentType}
                onChange={(e) => setIdDocumentType(e.target.value as IdDocumentType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
              >
                <option value="NINA">Carte NINA</option>
                <option value="CNI">Carte d'Identité Nationale (CNI)</option>
                <option value="Passeport">Passeport</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Numéro de pièce</label>
              <input
                type="text"
                placeholder="ex: 18204918204918F"
                value={idDocumentNumber}
                onChange={(e) => setIdDocumentNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Personne à contacter en cas d'urgence</label>
              <input
                type="text"
                placeholder="ex: Fatou Keïta (Épouse)"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tél urgence</label>
              <input
                type="text"
                placeholder="+223 70 00 00 00"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Affecter directement à un bien (Optionnel)
            </label>
            <select
              value={assignedPropertyId}
              onChange={(e) => setAssignedPropertyId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
            >
              <option value="">Aucun bien affecté pour l'instant</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.commune}) — {p.status === 'vacant' ? 'Disponible' : p.status}
                </option>
              ))}
            </select>
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
              Enregistrer le locataire
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
