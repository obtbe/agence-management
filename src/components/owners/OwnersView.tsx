import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  FileText, 
  Share2, 
  Building2, 
  Phone, 
  CheckCircle2, 
  DollarSign, 
  ArrowRight,
  CreditCard,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Owner } from '../../types';
import { formatFCFA, buildWhatsAppLink, formatMonthYearFR } from '../../utils/formatters';

interface OwnersViewProps {
  onOpenOwnerStatement: (ownerId: string) => void;
}

export const OwnersView: React.FC<OwnersViewProps> = ({ onOpenOwnerStatement }) => {
  const { 
    owners, 
    properties, 
    getOwnerStatement, 
    currentMonthYear, 
    agencyProfile, 
    addOwner,
    searchQuery,
    language 
  } = useApp();

  const [isAddOwnerOpen, setIsAddOwnerOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+223 ');
  const [whatsappNumber, setWhatsappNumber] = useState('+223 ');
  const [email, setEmail] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<Owner['payoutMethod']>('bank_transfer');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [address, setAddress] = useState('Bamako, Mali');
  const [notes, setNotes] = useState('');

  const filteredOwners = owners.filter((o) => {
    return (
      o.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddOwnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    addOwner({
      fullName,
      phone,
      whatsappNumber: whatsappNumber || phone,
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@proprietaire.ml`,
      payoutMethod,
      payoutDetails: payoutDetails || `Orange Money : ${phone}`,
      commissionRate: Number(commissionRate),
      address,
      notes: notes || undefined,
    });

    setIsAddOwnerOpen(false);
    setFullName('');
    setPhone('+223 ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {language === 'FR' ? 'Propriétaires & Bailleurs Mandants' : 'Owners & Landlords'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {filteredOwners.length} {language === 'FR' ? 'bailleurs avec mandats de gestion actifs' : 'owners with active management contracts'}
          </p>
        </div>

        <button
          onClick={() => setIsAddOwnerOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{language === 'FR' ? 'Nouveau bailleur' : 'New Owner'}</span>
        </button>
      </div>

      {/* Owners Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOwners.map((owner) => {
          const statement = getOwnerStatement(owner.id, currentMonthYear);
          const ownerProps = properties.filter((p) => p.ownerId === owner.id);

          return (
            <div
              key={owner.id}
              className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{owner.fullName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{owner.phone}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{owner.address}</p>
                  </div>

                  <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded border border-slate-200">
                    Com. {owner.commissionRate}%
                  </span>
                </div>

                {/* Properties list preview */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1.5">
                    <span className="font-semibold uppercase text-[10px]">
                      {ownerProps.length} {ownerProps.length > 1 ? 'Biens Immobiliers gérés' : 'Bien géré'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {ownerProps.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-slate-700">
                        <span className="truncate max-w-[200px] font-medium">{p.title}</span>
                        <span className="font-mono text-slate-500">{formatFCFA(p.rentAmount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary This Month */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs text-center">
                  <div className="p-2 rounded bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Loyers Bruts</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatFCFA(statement.grossRent)}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Dépenses/Com.</span>
                    <span className="font-mono font-semibold text-rose-700">
                      -{formatFCFA(statement.commissionAmount + statement.maintenanceCost)}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[10px] text-amber-900 font-bold block">Net Reversement</span>
                    <span className="font-mono font-extrabold text-amber-900">
                      {formatFCFA(statement.netPayout)}
                    </span>
                  </div>
                </div>

                {/* Payout method badge */}
                <div className="text-[11px] text-slate-500 bg-slate-100/60 px-3 py-1.5 rounded flex items-center justify-between">
                  <span>Mode prévu :</span>
                  <span className="font-mono text-slate-800 font-semibold">{owner.payoutDetails}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onOpenOwnerStatement(owner.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Relevé Mensuel Imprimable</span>
                </button>

                <a
                  href={buildWhatsAppLink(
                    owner.whatsappNumber || owner.phone,
                    `Bonjour M./Mme ${owner.fullName},\n\nVotre relevé de gestion locative pour le mois de *${formatMonthYearFR(currentMonthYear)}* est prêt.\nMontant net à vous reverser : *${formatFCFA(statement.netPayout)}*.\n\n— *${agencyProfile.name}*`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Envoyer WhatsApp</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Owner Modal */}
      {isAddOwnerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">Nouveau Propriétaire Mandant</h3>
              <button onClick={() => setIsAddOwnerOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOwnerSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom complet ou Société</label>
                <input
                  type="text"
                  required
                  placeholder="ex: El Hadj Cheick Oumar Touré"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mode de Reversement</label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value as Owner['payoutMethod'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
                  >
                    <option value="bank_transfer">Virement Bancaire (BDM, BOA...)</option>
                    <option value="orange_money">Orange Money Mali</option>
                    <option value="wave">Wave Mali</option>
                    <option value="cash">Espèces en agence</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Commission Agence (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Coordonnées de versement (Numéro ou IBAN)
                </label>
                <input
                  type="text"
                  placeholder="ex: BDM-SA · ML016 01001 02548901201 ou OM +223 76..."
                  value={payoutDetails}
                  onChange={(e) => setPayoutDetails(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse à Bamako</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOwnerOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
                >
                  Créer le bailleur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
