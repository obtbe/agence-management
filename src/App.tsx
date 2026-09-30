/**
 * Soba Bamako - Real Estate Management Platform
 * Tailored for Bamako, Mali Agencies
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { PropertiesView } from './components/properties/PropertiesView';
import { TenantsView } from './components/tenants/TenantsView';
import { OwnersView } from './components/owners/OwnersView';
import { PaymentsView } from './components/payments/PaymentsView';
import { LeasesView } from './components/leases/LeasesView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { ReportsView } from './components/reports/ReportsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { SettingsView } from './components/settings/SettingsView';

// Modals
import { RecordPaymentModal } from './components/modals/RecordPaymentModal';
import { RentReceiptModal } from './components/modals/RentReceiptModal';
import { OwnerStatementModal } from './components/modals/OwnerStatementModal';
import { RenewLeaseModal } from './components/modals/RenewLeaseModal';
import { AddPropertyModal } from './components/modals/AddPropertyModal';
import { AddTenantModal } from './components/modals/AddTenantModal';
import { LogMaintenanceModal } from './components/modals/LogMaintenanceModal';
import { Payment, Lease } from './types';

const MainAppContent: React.FC = () => {
  const { activeTab } = useApp();

  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  // Modal States
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState<boolean>(false);
  const [recordPaymentPrefill, setRecordPaymentPrefill] = useState<{ propertyId?: string; tenantId?: string }>({});

  const [activeReceiptPayment, setActiveReceiptPayment] = useState<Payment | null>(null);
  const [activeOwnerStatement, setActiveOwnerStatement] = useState<{ ownerId: string; monthYear?: string } | null>(null);
  const [activeRenewLease, setActiveRenewLease] = useState<Lease | null>(null);

  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState<boolean>(false);
  const [isAddTenantOpen, setIsAddTenantOpen] = useState<boolean>(false);
  const [isLogMaintenanceOpen, setIsLogMaintenanceOpen] = useState<boolean>(false);
  const [logMaintenancePropertyId, setLogMaintenancePropertyId] = useState<string | undefined>(undefined);

  const handleOpenRecordPayment = (propertyId?: string, tenantId?: string) => {
    setRecordPaymentPrefill({ propertyId, tenantId });
    setIsRecordPaymentOpen(true);
  };

  const handleOpenLogMaintenance = (propertyId?: string) => {
    setLogMaintenancePropertyId(propertyId);
    setIsLogMaintenanceOpen(true);
  };

  const handleOpenOwnerStatement = (ownerId: string, monthYear?: string) => {
    setActiveOwnerStatement({ ownerId, monthYear });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar isOpenMobile={isOpenMobile} setIsOpenMobile={setIsOpenMobile} />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          setIsOpenMobile={setIsOpenMobile}
          onOpenRecordPayment={() => handleOpenRecordPayment()}
          onOpenNewProperty={() => setIsAddPropertyOpen(true)}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenRecordPayment={() => handleOpenRecordPayment()}
              onOpenNewProperty={() => setIsAddPropertyOpen(true)}
              onOpenNewTenant={() => setIsAddTenantOpen(true)}
              onOpenLogMaintenance={() => handleOpenLogMaintenance()}
            />
          )}

          {activeTab === 'properties' && (
            <PropertiesView
              onOpenNewProperty={() => setIsAddPropertyOpen(true)}
              onOpenRecordPayment={(propId) => handleOpenRecordPayment(propId)}
              onOpenLogMaintenance={(propId) => handleOpenLogMaintenance(propId)}
            />
          )}

          {activeTab === 'tenants' && (
            <TenantsView
              onOpenNewTenant={() => setIsAddTenantOpen(true)}
              onOpenRecordPayment={(propId, tId) => handleOpenRecordPayment(propId, tId)}
              onOpenRentReceipt={(payment) => setActiveReceiptPayment(payment)}
            />
          )}

          {activeTab === 'owners' && (
            <OwnersView
              onOpenOwnerStatement={(ownerId) => handleOpenOwnerStatement(ownerId)}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              onOpenRecordPayment={() => handleOpenRecordPayment()}
              onOpenRentReceipt={(payment) => setActiveReceiptPayment(payment)}
            />
          )}

          {activeTab === 'leases' && (
            <LeasesView
              onOpenRenewLease={(lease) => setActiveRenewLease(lease)}
            />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceView
              onOpenLogMaintenance={(propId) => handleOpenLogMaintenance(propId)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              onOpenOwnerStatement={(ownerId, month) => handleOpenOwnerStatement(ownerId, month)}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView
              onOpenRecordPayment={(propId, tId) => handleOpenRecordPayment(propId, tId)}
              onOpenRenewLease={(lease) => setActiveRenewLease(lease)}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Interactive Global Modals */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        preselectedPropertyId={recordPaymentPrefill.propertyId}
        preselectedTenantId={recordPaymentPrefill.tenantId}
      />

      <RentReceiptModal
        payment={activeReceiptPayment}
        onClose={() => setActiveReceiptPayment(null)}
      />

      {activeOwnerStatement && (
        <OwnerStatementModal
          ownerId={activeOwnerStatement.ownerId}
          initialMonthYear={activeOwnerStatement.monthYear}
          onClose={() => setActiveOwnerStatement(null)}
        />
      )}

      <RenewLeaseModal
        lease={activeRenewLease}
        onClose={() => setActiveRenewLease(null)}
      />

      <AddPropertyModal
        isOpen={isAddPropertyOpen}
        onClose={() => setIsAddPropertyOpen(false)}
      />

      <AddTenantModal
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
      />

      <LogMaintenanceModal
        isOpen={isLogMaintenanceOpen}
        onClose={() => setIsLogMaintenanceOpen(false)}
        preselectedPropertyId={logMaintenancePropertyId}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
