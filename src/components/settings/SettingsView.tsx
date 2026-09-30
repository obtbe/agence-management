import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  Users, 
  Database, 
  Save, 
  Plus, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  ShieldCheck, 
  Phone, 
  CreditCard 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TeamMember } from '../../types';

export const SettingsView: React.FC = () => {
  const { 
    agencyProfile, 
    updateAgencyProfile, 
    teamMembers, 
    addTeamMember, 
    activeUser, 
    setActiveUser, 
    resetToSampleData, 
    exportDataBackup, 
    importDataBackup,
    language 
  } = useApp();

  const [name, setName] = useState(agencyProfile.name);
  const [slogan, setSlogan] = useState(agencyProfile.slogan);
  const [address, setAddress] = useState(agencyProfile.address);
  const [phone, setPhone] = useState(agencyProfile.phone);
  const [email, setEmail] = useState(agencyProfile.email);
  const [rccm, setRccm] = useState(agencyProfile.rccm);
  const [nif, setNif] = useState(agencyProfile.nif);
  const [bankDetails, setBankDetails] = useState(agencyProfile.bankDetails);
  const [orangeMoneyMerchant, setOrangeMoneyMerchant] = useState(agencyProfile.orangeMoneyMerchant);
  const [waveMerchant, setWaveMerchant] = useState(agencyProfile.waveMerchant);
  const [defaultCommissionRate, setDefaultCommissionRate] = useState(agencyProfile.defaultCommissionRate);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Add team member form
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<TeamMember['role']>('property_agent');
  const [newMemberPhone, setNewMemberPhone] = useState('+223 ');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateAgencyProfile({
      name,
      slogan,
      address,
      phone,
      email,
      rccm,
      nif,
      bankDetails,
      orangeMoneyMerchant,
      waveMerchant,
      defaultCommissionRate: Number(defaultCommissionRate),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName) return;

    addTeamMember({
      name: newMemberName,
      role: newMemberRole,
      phone: newMemberPhone,
      email: newMemberEmail || `${newMemberName.toLowerCase().replace(/\s+/g, '.')}@sobabamako.ml`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      status: 'active',
    });

    setIsAddTeamOpen(false);
    setNewMemberName('');
    setNewMemberPhone('+223 ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {language === 'FR' ? 'Configuration de l\'Agence & Équipe' : 'Agency Profile & Team'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'FR' 
              ? 'Paramètres administratifs légaux, comptes marchands Bamako et accès collaborateurs' 
              : 'Legal credentials, Bamako merchant numbers and team roles'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Agency Profile Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Profil Administratif de l'Agence</span>
            </h3>
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Enregistré !
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Raison Sociale</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Slogan / Sous-titre</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Adresse à Bamako</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Téléphone Principal</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Officiel</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Legal identifiers Mali */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Numéro RCCM (Mali)</label>
                <input
                  type="text"
                  value={rccm}
                  onChange={(e) => setRccm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Numéro NIF (Mali)</label>
                <input
                  type="text"
                  value={nif}
                  onChange={(e) => setNif(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Mobile money & Banking */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compte Marchand Orange Money</label>
                <input
                  type="text"
                  value={orangeMoneyMerchant}
                  onChange={(e) => setOrangeMoneyMerchant(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Commission Agence par Défaut (%)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={defaultCommissionRate}
                  onChange={(e) => setDefaultCommissionRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Coordonnées Bancaires (RIB BDM-SA / BOA)</label>
              <input
                type="text"
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer les paramètres de l'agence</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Team & Data Management */}
        <div className="space-y-6">
          {/* Team Members List */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Équipe & Rôles</span>
              </h3>
              <button
                onClick={() => setIsAddTeamOpen(true)}
                className="p-1 text-slate-500 hover:text-amber-700 rounded"
                title="Ajouter un collaborateur"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {teamMembers.map((member) => {
                const isCurrent = activeUser.id === member.id;
                return (
                  <div
                    key={member.id}
                    onClick={() => setActiveUser(member)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between text-xs ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/40 text-slate-900 font-medium'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{member.name}</p>
                        <p className="text-[11px] text-slate-500 capitalize">
                          {member.role.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="text-[10px] font-bold text-amber-900 uppercase">Actif</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data Backup & Reset */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Database className="w-4 h-4 text-slate-600" />
              <span>Sauvegarde & Données</span>
            </h3>

            <p className="text-slate-500 text-[11px]">
              Toutes les données sont conservées localement. Vous pouvez exporter une archive JSON à tout moment.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={exportDataBackup}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Télécharger la Sauvegarde JSON</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Voulez-vous réinitialiser toutes les données avec les exemples de Bamako ?')) {
                    resetToSampleData();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>Réinitialiser aux Données Démo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
