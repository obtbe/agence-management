import React from 'react';
import { 
  Menu, 
  Search, 
  PlusCircle, 
  Bell, 
  Globe, 
  CheckCircle,
  Building,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  setIsOpenMobile: (open: boolean) => void;
  onOpenRecordPayment: () => void;
  onOpenNewProperty: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  setIsOpenMobile, 
  onOpenRecordPayment,
  onOpenNewProperty
}) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    activeUser, 
    language, 
    setLanguage, 
    overdueCount, 
    expiringLeasesCount,
    setActiveTab,
    activeTab
  } = useApp();

  const totalAlerts = overdueCount + expiringLeasesCount;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 no-print">
      {/* Left: Mobile trigger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={() => setIsOpenMobile(true)}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'FR'
                ? 'Rechercher un bien, locataire, bailleur, quartier (ex: ACI 2000)...'
                : 'Search property, tenant, owner, district...'
            }
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Quick actions buttons */}
        <button
          onClick={onOpenRecordPayment}
          className="flex items-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">
            {language === 'FR' ? 'Encaisser un loyer' : 'Record Rent'}
          </span>
        </button>

        <button
          onClick={onOpenNewProperty}
          className="hidden lg:flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
        >
          <Building className="w-4 h-4 text-slate-500" />
          <span>{language === 'FR' ? 'Nouveau bien' : 'New Property'}</span>
        </button>

        {/* Notifications Icon */}
        <button
          onClick={() => setActiveTab('notifications')}
          className={`relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors ${activeTab === 'notifications' ? 'bg-amber-50 text-amber-700' : ''}`}
          title={language === 'FR' ? 'Alertes & Relances' : 'Alerts & Reminders'}
        >
          <Bell className="w-4 h-4" />
          {totalAlerts > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
          )}
        </button>

        {/* Language switch */}
        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden text-xs font-semibold">
          <button
            onClick={() => setLanguage('FR')}
            className={`px-2 py-1.5 transition-colors ${language === 'FR' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            FR
          </button>
          <button
            onClick={() => setLanguage('EN')}
            className={`px-2 py-1.5 transition-colors ${language === 'EN' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            EN
          </button>
        </div>

        {/* Current User */}
        <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <img
            src={activeUser.avatar}
            alt={activeUser.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div className="text-left text-xs">
            <div className="font-semibold text-slate-800 leading-tight">{activeUser.name}</div>
            <div className="text-slate-500 capitalize">{activeUser.role.replace('_', ' ')}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
