import React from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  Home, 
  Users, 
  Briefcase, 
  CreditCard, 
  FileText, 
  Wrench, 
  BarChart3, 
  Bell, 
  Settings,
  ChevronRight,
  Phone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, setIsOpenMobile }) => {
  const { 
    activeTab, 
    setActiveTab, 
    agencyProfile, 
    overdueCount, 
    expiringLeasesCount, 
    pendingMaintenanceCount,
    language 
  } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: language === 'FR' ? 'Tableau de bord' : 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'properties',
      label: language === 'FR' ? 'Biens Immobiliers' : 'Properties',
      icon: Home,
      badge: null,
    },
    {
      id: 'tenants',
      label: language === 'FR' ? 'Locataires' : 'Tenants',
      icon: Users,
      badge: null,
    },
    {
      id: 'owners',
      label: language === 'FR' ? 'Propriétaires' : 'Owners',
      icon: Briefcase,
      badge: null,
    },
    {
      id: 'payments',
      label: language === 'FR' ? 'Paiements & Loyers' : 'Payments',
      icon: CreditCard,
      badge: overdueCount > 0 ? { count: overdueCount, color: 'text-amber-600 bg-amber-50' } : null,
    },
    {
      id: 'leases',
      label: language === 'FR' ? 'Baux & Contrats' : 'Leases',
      icon: FileText,
      badge: expiringLeasesCount > 0 ? { count: expiringLeasesCount, color: 'text-rose-600 bg-rose-50' } : null,
    },
    {
      id: 'maintenance',
      label: language === 'FR' ? 'Maintenance' : 'Maintenance',
      icon: Wrench,
      badge: pendingMaintenanceCount > 0 ? { count: pendingMaintenanceCount, color: 'text-slate-600 bg-slate-100' } : null,
    },
    {
      id: 'reports',
      label: language === 'FR' ? 'Rapports & Relevés' : 'Reports',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'notifications',
      label: language === 'FR' ? 'Relances & Alertes' : 'Alerts & WhatsApp',
      icon: Bell,
      badge: (overdueCount + expiringLeasesCount) > 0 ? { count: overdueCount + expiringLeasesCount, color: 'text-amber-700 bg-amber-100' } : null,
    },
    {
      id: 'settings',
      label: language === 'FR' ? 'Paramètres Agence' : 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out
        md:static md:translate-x-0
        ${isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                {agencyProfile.name.split(' ')[0]} 
                <span className="text-amber-400 font-semibold">{agencyProfile.name.split(' ').slice(1).join(' ')}</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Bamako · Mali</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
                  ${isActive 
                    ? 'bg-amber-500/15 text-amber-300 font-semibold' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${item.badge.color}`}>
                    {item.badge.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Agency Quick Info & Support footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Orange Money Agence</span>
            <span className="text-emerald-400 font-mono">Actif</span>
          </div>
          <div className="text-xs font-mono text-slate-300 bg-slate-800/60 rounded px-2.5 py-1.5 border border-slate-700/60 truncate">
            {agencyProfile.orangeMoneyMerchant}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{agencyProfile.phone}</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
