export type PropertyType = 'villa' | 'appartement' | 'immeuble' | 'commercial' | 'duplex';
export type PropertyStatus = 'occupied' | 'vacant' | 'maintenance' | 'reserved';
export type BamakoCommune = 
  | 'ACI 2000'
  | 'Badalabougou'
  | 'Hamdallaye ACI'
  | 'Hippodrome'
  | 'Bacodjicoroni Golf'
  | 'Yirimadio'
  | 'Korofina'
  | 'Sotuba'
  | 'Sébénikoro';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  commune: BamakoCommune;
  address: string;
  bedrooms: number;
  bathrooms: number;
  surfaceArea: number; // m2
  rentAmount: number; // in FCFA
  cautionAmount: number; // in FCFA (deposit)
  agencyCommissionRate: number; // e.g. 10%
  status: PropertyStatus;
  ownerId: string;
  currentTenantId?: string;
  currentLeaseId?: string;
  photos: string[];
  amenities: string[];
  utilitiesInfo: string; // e.g. "Compteur ISAGO prépayé, Forage solaire + SOMAGEP, Groupe électrogène 20kVA"
  description: string;
  createdAt: string;
}

export type IdDocumentType = 'NINA' | 'CNI' | 'Passeport';

export interface Tenant {
  id: string;
  fullName: string;
  phone: string; // e.g. +223 76 12 34 56
  whatsappNumber: string;
  email: string;
  profession: string;
  idDocumentType: IdDocumentType;
  idDocumentNumber: string;
  emergencyContact: string;
  emergencyPhone: string;
  currentPropertyId?: string;
  status: 'active' | 'past' | 'pending';
  joinedDate: string;
  notes?: string;
}

export type PayoutMethod = 'orange_money' | 'wave' | 'moov' | 'bank_transfer' | 'cash';

export interface Owner {
  id: string;
  fullName: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  payoutMethod: PayoutMethod;
  payoutDetails: string; // e.g. "Orange Money: +223 76 00 00 00" or "BDM-SA: ML016 01001..."
  commissionRate: number; // default agency fee (e.g. 10%)
  address: string;
  notes?: string;
}

export type LeaseStatus = 'active' | 'expiring_soon' | 'expired' | 'terminated';

export interface Lease {
  id: string;
  propertyId: string;
  tenantId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  rentAmount: number; // FCFA
  cautionMonths: number;
  cautionAmount: number; // FCFA
  paymentDueDay: number; // day of month, e.g. 5
  status: LeaseStatus;
  renewalNoticeSent?: boolean;
  termsNotes?: string;
}

export type PaymentMethod = 'orange_money' | 'wave' | 'moov_money' | 'bank_transfer' | 'cash';
export type PaymentStatus = 'paid' | 'late' | 'pending';

export interface Payment {
  id: string;
  propertyId: string;
  tenantId: string;
  ownerId: string;
  leaseId: string;
  monthYear: string; // e.g. "2026-09"
  amount: number; // FCFA
  datePaid?: string;
  dueDate: string; // e.g. "2026-09-05"
  paymentMethod?: PaymentMethod;
  transactionRef?: string; // OM or Wave transaction code
  status: PaymentStatus;
  receiptNumber: string; // e.g. "QUIT-2026-09-042"
  recordedBy?: string;
  notes?: string;
}

export type MaintenanceCategory = 
  | 'climatisation'
  | 'plomberie'
  | 'electricite'
  | 'forage'
  | 'groupe_electrogene'
  | 'peinture'
  | 'menuiserie'
  | 'autre';

export type MaintenanceStatus = 'reported' | 'in_progress' | 'completed';

export interface Maintenance {
  id: string;
  propertyId: string;
  ownerId: string;
  title: string;
  category: MaintenanceCategory;
  cost: number; // FCFA
  reportedDate: string;
  completedDate?: string;
  status: MaintenanceStatus;
  artisanName: string;
  artisanPhone: string;
  deductFromOwnerPayout: boolean;
  notes?: string;
}

export interface Activity {
  id: string;
  type: 'payment' | 'lease' | 'maintenance' | 'tenant' | 'property';
  title: string;
  description: string;
  timestamp: string;
  iconName: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'director' | 'agency_manager' | 'property_agent' | 'accountant';
  phone: string;
  email: string;
  avatar: string;
  status: 'active' | 'away';
}

export interface AgencyProfile {
  name: string;
  slogan: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  rccm: string; // Registre du Commerce Mali
  nif: string; // Numéro d'Identification Fiscale
  bankDetails: string;
  orangeMoneyMerchant: string;
  waveMerchant: string;
  defaultCommissionRate: number;
  currency: string;
}
