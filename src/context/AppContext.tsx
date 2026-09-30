import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Property, 
  Tenant, 
  Owner, 
  Lease, 
  Payment, 
  Maintenance, 
  Activity, 
  TeamMember, 
  AgencyProfile 
} from '../types';
import { 
  initialAgencyProfile, 
  initialOwners, 
  initialTenants, 
  initialProperties, 
  initialLeases, 
  initialPayments, 
  initialMaintenance, 
  initialActivities, 
  initialTeamMembers 
} from '../data/initialData';

interface OwnerStatementData {
  owner: Owner;
  monthYear: string;
  grossRent: number;
  commissionRate: number;
  commissionAmount: number;
  maintenanceCost: number;
  netPayout: number;
  payments: Payment[];
  maintenanceItems: Maintenance[];
  properties: Property[];
}

interface AppContextType {
  // Navigation & state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: 'FR' | 'EN';
  setLanguage: (lang: 'FR' | 'EN') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Data
  agencyProfile: AgencyProfile;
  properties: Property[];
  tenants: Tenant[];
  owners: Owner[];
  leases: Lease[];
  payments: Payment[];
  maintenance: Maintenance[];
  activities: Activity[];
  teamMembers: TeamMember[];
  activeUser: TeamMember;
  selectedPropertyId: string | null;
  setSelectedPropertyId: (id: string | null) => void;

  // Computed KPIs
  currentMonthYear: string; // e.g. "2026-09"
  occupancyRate: number;
  collectionRate: number;
  overdueCount: number;
  totalExpectedRent: number;
  totalCollectedRent: number;
  totalAgencyCommission: number;
  totalMaintenanceCosts: number;
  expiringLeasesCount: number;
  pendingMaintenanceCount: number;

  // Actions
  addProperty: (property: Omit<Property, 'id' | 'createdAt'>) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;

  addTenant: (tenant: Omit<Tenant, 'id' | 'joinedDate'>) => void;
  updateTenant: (id: string, updates: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;

  addOwner: (owner: Omit<Owner, 'id'>) => void;
  updateOwner: (id: string, updates: Partial<Owner>) => void;
  deleteOwner: (id: string) => void;

  recordPayment: (paymentData: {
    propertyId: string;
    tenantId: string;
    monthYear: string;
    amount: number;
    paymentMethod: Payment['paymentMethod'];
    transactionRef?: string;
    notes?: string;
    datePaid?: string;
  }) => Payment;
  updatePayment: (id: string, updates: Partial<Payment>) => void;

  addLease: (lease: Omit<Lease, 'id'>) => void;
  renewLease: (leaseId: string, newEndDate: string, newRent?: number) => void;
  updateLease: (id: string, updates: Partial<Lease>) => void;

  logMaintenance: (data: Omit<Maintenance, 'id' | 'reportedDate'>) => void;
  updateMaintenance: (id: string, updates: Partial<Maintenance>) => void;
  deleteMaintenance: (id: string) => void;

  updateAgencyProfile: (profile: Partial<AgencyProfile>) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  setActiveUser: (user: TeamMember) => void;

  // Calculations
  getOwnerStatement: (ownerId: string, monthYear: string) => OwnerStatementData;

  // System
  resetToSampleData: () => void;
  exportDataBackup: () => void;
  importDataBackup: (jsonData: string) => boolean;
}

const STORAGE_KEY = 'soba_bamako_db_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [language, setLanguage] = useState<'FR' | 'EN'>('FR');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Core collections initialized from LocalStorage or defaults
  const [agencyProfile, setAgencyProfile] = useState<AgencyProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
    return saved ? JSON.parse(saved) : initialAgencyProfile;
  });

  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_properties`);
    return saved ? JSON.parse(saved) : initialProperties;
  });

  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tenants`);
    return saved ? JSON.parse(saved) : initialTenants;
  });

  const [owners, setOwners] = useState<Owner[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_owners`);
    return saved ? JSON.parse(saved) : initialOwners;
  });

  const [leases, setLeases] = useState<Lease[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_leases`);
    return saved ? JSON.parse(saved) : initialLeases;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [maintenance, setMaintenance] = useState<Maintenance[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_maintenance`);
    return saved ? JSON.parse(saved) : initialMaintenance;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_team`);
    return saved ? JSON.parse(saved) : initialTeamMembers;
  });

  const [activeUser, setActiveUser] = useState<TeamMember>(() => teamMembers[0] || initialTeamMembers[0]);

  // Persist to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(agencyProfile));
  }, [agencyProfile]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_properties`, JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tenants`, JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_owners`, JSON.stringify(owners));
  }, [owners]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_leases`, JSON.stringify(leases));
  }, [leases]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_maintenance`, JSON.stringify(maintenance));
  }, [maintenance]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_team`, JSON.stringify(teamMembers));
  }, [teamMembers]);

  // Current Month/Year for calculations
  const currentMonthYear = '2026-09';

  // Helper to log activities
  const logActivity = (type: Activity['type'], title: string, description: string, iconName: string) => {
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      type,
      title,
      description,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      iconName,
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // KPIs
  const totalPropertiesCount = properties.length;
  const occupiedPropertiesCount = properties.filter((p) => p.status === 'occupied').length;
  const occupancyRate = totalPropertiesCount > 0 
    ? Math.round((occupiedPropertiesCount / totalPropertiesCount) * 100) 
    : 0;

  // Payments for current month
  const currentMonthPayments = useMemo(() => {
    return payments.filter((p) => p.monthYear === currentMonthYear);
  }, [payments, currentMonthYear]);

  // Expected rent for current month from all active leases
  const totalExpectedRent = useMemo(() => {
    return leases
      .filter((l) => l.status === 'active' || l.status === 'expiring_soon')
      .reduce((sum, l) => sum + l.rentAmount, 0);
  }, [leases]);

  // Total actually collected this month
  const totalCollectedRent = useMemo(() => {
    return currentMonthPayments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [currentMonthPayments]);

  const collectionRate = totalExpectedRent > 0 
    ? Math.round((totalCollectedRent / totalExpectedRent) * 100) 
    : 0;

  const overdueCount = useMemo(() => {
    return currentMonthPayments.filter((p) => p.status === 'late').length;
  }, [currentMonthPayments]);

  // Agency commission earned on collected rent
  const totalAgencyCommission = useMemo(() => {
    return currentMonthPayments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => {
        const prop = properties.find((pr) => pr.id === p.propertyId);
        const rate = prop?.agencyCommissionRate || agencyProfile.defaultCommissionRate || 10;
        return sum + (p.amount * rate) / 100;
      }, 0);
  }, [currentMonthPayments, properties, agencyProfile]);

  // Maintenance costs this month
  const totalMaintenanceCosts = useMemo(() => {
    return maintenance
      .filter((m) => m.reportedDate.startsWith(currentMonthYear))
      .reduce((sum, m) => sum + m.cost, 0);
  }, [maintenance, currentMonthYear]);

  // Expiring leases (within 60 days or status expiring_soon)
  const expiringLeasesCount = useMemo(() => {
    return leases.filter((l) => l.status === 'expiring_soon').length;
  }, [leases]);

  const pendingMaintenanceCount = useMemo(() => {
    return maintenance.filter((m) => m.status === 'reported' || m.status === 'in_progress').length;
  }, [maintenance]);

  // CRUD Actions
  const addProperty = (data: Omit<Property, 'id' | 'createdAt'>) => {
    const newProperty: Property = {
      ...data,
      id: `prop-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProperties((prev) => [newProperty, ...prev]);
    logActivity('property', 'Nouveau bien ajouté', `${newProperty.title} (${newProperty.commune})`, 'Home');
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProperty = (id: string) => {
    const prop = properties.find((p) => p.id === id);
    setProperties((prev) => prev.filter((p) => p.id !== id));
    if (prop) {
      logActivity('property', 'Bien supprimé', `${prop.title} a été retiré`, 'Trash2');
    }
  };

  const addTenant = (data: Omit<Tenant, 'id' | 'joinedDate'>) => {
    const newTenant: Tenant = {
      ...data,
      id: `tenant-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setTenants((prev) => [newTenant, ...prev]);
    logActivity('tenant', 'Nouveau locataire enregistré', `${newTenant.fullName} - ${newTenant.phone}`, 'UserPlus');
  };

  const updateTenant = (id: string, updates: Partial<Tenant>) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTenant = (id: string) => {
    setTenants((prev) => prev.filter((t) => t.id !== id));
  };

  const addOwner = (data: Omit<Owner, 'id'>) => {
    const newOwner: Owner = {
      ...data,
      id: `owner-${Date.now()}`,
    };
    setOwners((prev) => [newOwner, ...prev]);
    logActivity('property', 'Nouveau bailleur enregistré', `${newOwner.fullName} (${newOwner.phone})`, 'Briefcase');
  };

  const updateOwner = (id: string, updates: Partial<Owner>) => {
    setOwners((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  };

  const deleteOwner = (id: string) => {
    setOwners((prev) => prev.filter((o) => o.id !== id));
  };

  const recordPayment = (paymentData: {
    propertyId: string;
    tenantId: string;
    monthYear: string;
    amount: number;
    paymentMethod: Payment['paymentMethod'];
    transactionRef?: string;
    notes?: string;
    datePaid?: string;
  }): Payment => {
    const prop = properties.find((p) => p.id === paymentData.propertyId);
    const tenant = tenants.find((t) => t.id === paymentData.tenantId);
    const existingIndex = payments.findIndex(
      (p) => p.propertyId === paymentData.propertyId && p.monthYear === paymentData.monthYear
    );

    const receiptNumber = `QUIT-${paymentData.monthYear}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      propertyId: paymentData.propertyId,
      tenantId: paymentData.tenantId,
      ownerId: prop?.ownerId || '',
      leaseId: prop?.currentLeaseId || '',
      monthYear: paymentData.monthYear,
      amount: paymentData.amount,
      datePaid: paymentData.datePaid || new Date().toISOString().split('T')[0],
      dueDate: `${paymentData.monthYear}-05`,
      paymentMethod: paymentData.paymentMethod,
      transactionRef: paymentData.transactionRef || `REF-${Date.now().toString().slice(-6)}`,
      status: 'paid',
      receiptNumber,
      recordedBy: activeUser.name,
      notes: paymentData.notes,
    };

    if (existingIndex >= 0) {
      // Update existing payment
      setPayments((prev) => {
        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], ...newPayment, id: next[existingIndex].id };
        return next;
      });
    } else {
      setPayments((prev) => [newPayment, ...prev]);
    }

    logActivity(
      'payment',
      'Encaissement loyer enregistré',
      `${tenant?.fullName || 'Locataire'} - ${paymentData.amount.toLocaleString('fr-FR')} FCFA (${paymentData.paymentMethod?.toUpperCase()})`,
      'CheckCircle2'
    );

    return newPayment;
  };

  const updatePayment = (id: string, updates: Partial<Payment>) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const addLease = (leaseData: Omit<Lease, 'id'>) => {
    const newLease: Lease = {
      ...leaseData,
      id: `lease-${Date.now()}`,
    };
    setLeases((prev) => [newLease, ...prev]);

    // Update property with tenant & lease
    updateProperty(leaseData.propertyId, {
      currentTenantId: leaseData.tenantId,
      currentLeaseId: newLease.id,
      status: 'occupied',
      rentAmount: leaseData.rentAmount,
    });

    // Update tenant current property
    updateTenant(leaseData.tenantId, {
      currentPropertyId: leaseData.propertyId,
      status: 'active',
    });

    logActivity('lease', 'Nouveau bail signé', `Bail créé jusqu'au ${newLease.endDate}`, 'FileText');
  };

  const renewLease = (leaseId: string, newEndDate: string, newRent?: number) => {
    const lease = leases.find((l) => l.id === leaseId);
    if (!lease) return;

    setLeases((prev) =>
      prev.map((l) =>
        l.id === leaseId
          ? {
              ...l,
              endDate: newEndDate,
              rentAmount: newRent !== undefined ? newRent : l.rentAmount,
              status: 'active',
              renewalNoticeSent: false,
            }
          : l
      )
    );

    if (newRent !== undefined) {
      updateProperty(lease.propertyId, { rentAmount: newRent });
    }

    logActivity('lease', 'Bail renouvelé', `Contrat prorogé jusqu'au ${newEndDate}`, 'RefreshCw');
  };

  const updateLease = (id: string, updates: Partial<Lease>) => {
    setLeases((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  const logMaintenance = (data: Omit<Maintenance, 'id' | 'reportedDate'>) => {
    const newMaint: Maintenance = {
      ...data,
      id: `maint-${Date.now()}`,
      reportedDate: new Date().toISOString().split('T')[0],
    };
    setMaintenance((prev) => [newMaint, ...prev]);

    const prop = properties.find((p) => p.id === data.propertyId);
    logActivity(
      'maintenance',
      'Travaux / Réparation enregistrés',
      `${data.title} (${data.cost.toLocaleString('fr-FR')} FCFA) - ${prop?.title || ''}`,
      'Wrench'
    );
  };

  const updateMaintenance = (id: string, updates: Partial<Maintenance>) => {
    setMaintenance((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const deleteMaintenance = (id: string) => {
    setMaintenance((prev) => prev.filter((m) => m.id !== id));
  };

  const updateAgencyProfile = (profile: Partial<AgencyProfile>) => {
    setAgencyProfile((prev) => ({ ...prev, ...profile }));
  };

  const addTeamMember = (member: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...member,
      id: `user-${Date.now()}`,
    };
    setTeamMembers((prev) => [...prev, newMember]);
  };

  // Generate Owner Statement (Relevé de compte propriétaire)
  const getOwnerStatement = (ownerId: string, monthYear: string): OwnerStatementData => {
    const owner = owners.find((o) => o.id === ownerId) || owners[0];
    const ownerProperties = properties.filter((p) => p.ownerId === ownerId);
    const ownerPropIds = ownerProperties.map((p) => p.id);

    // Payments collected for this owner in this month
    const ownerPayments = payments.filter(
      (p) => ownerPropIds.includes(p.propertyId) && p.monthYear === monthYear && p.status === 'paid'
    );

    const grossRent = ownerPayments.reduce((sum, p) => sum + p.amount, 0);
    const commissionRate = owner.commissionRate || agencyProfile.defaultCommissionRate || 10;
    const commissionAmount = Math.round((grossRent * commissionRate) / 100);

    // Deductible maintenance recorded for this owner
    const maintenanceItems = maintenance.filter(
      (m) =>
        ownerPropIds.includes(m.propertyId) &&
        m.deductFromOwnerPayout &&
        m.reportedDate.startsWith(monthYear)
    );

    const maintenanceCost = maintenanceItems.reduce((sum, m) => sum + m.cost, 0);
    const netPayout = Math.max(0, grossRent - commissionAmount - maintenanceCost);

    return {
      owner,
      monthYear,
      grossRent,
      commissionRate,
      commissionAmount,
      maintenanceCost,
      netPayout,
      payments: ownerPayments,
      maintenanceItems,
      properties: ownerProperties,
    };
  };

  // Reset to initial sample data
  const resetToSampleData = () => {
    setAgencyProfile(initialAgencyProfile);
    setOwners(initialOwners);
    setTenants(initialTenants);
    setProperties(initialProperties);
    setLeases(initialLeases);
    setPayments(initialPayments);
    setMaintenance(initialMaintenance);
    setActivities(initialActivities);
    setTeamMembers(initialTeamMembers);
    setActiveUser(initialTeamMembers[0]);
    localStorage.clear();
  };

  // Export full JSON backup
  const exportDataBackup = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      agencyProfile,
      owners,
      tenants,
      properties,
      leases,
      payments,
      maintenance,
      activities,
      teamMembers,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soba_bamako_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const importDataBackup = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.agencyProfile) setAgencyProfile(data.agencyProfile);
      if (data.owners) setOwners(data.owners);
      if (data.tenants) setTenants(data.tenants);
      if (data.properties) setProperties(data.properties);
      if (data.leases) setLeases(data.leases);
      if (data.payments) setPayments(data.payments);
      if (data.maintenance) setMaintenance(data.maintenance);
      if (data.activities) setActivities(data.activities);
      if (data.teamMembers) setTeamMembers(data.teamMembers);
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        searchQuery,
        setSearchQuery,
        agencyProfile,
        properties,
        tenants,
        owners,
        leases,
        payments,
        maintenance,
        activities,
        teamMembers,
        activeUser,
        selectedPropertyId,
        setSelectedPropertyId,
        currentMonthYear,
        occupancyRate,
        collectionRate,
        overdueCount,
        totalExpectedRent,
        totalCollectedRent,
        totalAgencyCommission,
        totalMaintenanceCosts,
        expiringLeasesCount,
        pendingMaintenanceCount,
        addProperty,
        updateProperty,
        deleteProperty,
        addTenant,
        updateTenant,
        deleteTenant,
        addOwner,
        updateOwner,
        deleteOwner,
        recordPayment,
        updatePayment,
        addLease,
        renewLease,
        updateLease,
        logMaintenance,
        updateMaintenance,
        deleteMaintenance,
        updateAgencyProfile,
        addTeamMember,
        setActiveUser,
        getOwnerStatement,
        resetToSampleData,
        exportDataBackup,
        importDataBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
