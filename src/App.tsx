import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { ContextualHelpModal } from './components/common/ContextualHelp';
import { CalculationDetailDrawer } from './components/common/CalculationDetailDrawer';

// Landing & Auth
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterBazarWizard } from './components/auth/RegisterBazarWizard';

// Superadmin Views
import { SuperadminDashboard } from './components/superadmin/SuperadminDashboard';
import { BazarManagement } from './components/superadmin/BazarManagement';
import { UserManagement } from './components/superadmin/UserManagement';
import { AuditLogView } from './components/superadmin/AuditLogView';

// Owner Views
import { OwnerDashboard } from './components/owner/OwnerDashboard';
import { ClientList } from './components/owner/ClientList';
import { ProductCatalog } from './components/owner/ProductCatalog';
import { NewSaleWizard } from './components/owner/NewSaleWizard';
import { AccountStatements } from './components/owner/AccountStatements';
import { PaymentsManager } from './components/owner/PaymentsManager';
import { InstallmentLoans } from './components/owner/InstallmentLoans';
import { FinancialConfig } from './components/owner/FinancialConfig';
import { FinancialReports } from './components/owner/FinancialReports';

// Client Views
import { ClientPortal } from './components/client/ClientPortal';

function MainApp() {
  const { currentRole } = useApp();

  // Screen Mode: 'app' | 'landing' | 'login' | 'register'
  const [screenMode, setScreenMode] = useState<'app' | 'landing' | 'login' | 'register'>('app');

  // Navigation views
  const [activeView, setActiveView] = useState<string>('dashboard');

  // Cross-view state (e.g. passing clientId to new sale or liquidationId to payments)
  const [targetSaleClientId, setTargetSaleClientId] = useState<string | undefined>(undefined);
  const [targetPaymentLiqId, setTargetPaymentLiqId] = useState<string | undefined>(undefined);

  // If in Public Landing mode
  if (screenMode === 'landing') {
    return (
      <LandingPage
        onGoToLogin={() => setScreenMode('login')}
        onGoToRegister={() => setScreenMode('register')}
      />
    );
  }

  // If in Login mode
  if (screenMode === 'login') {
    return (
      <LoginPage
        onSuccess={() => setScreenMode('app')}
        onGoToRegister={() => setScreenMode('register')}
        onBackToLanding={() => setScreenMode('landing')}
      />
    );
  }

  // If in Register Bazar mode
  if (screenMode === 'register') {
    return (
      <RegisterBazarWizard
        onBackToLogin={() => setScreenMode('login')}
        onSuccess={() => {
          setActiveView('dashboard');
          setScreenMode('app');
        }}
      />
    );
  }

  // Handle cross-navigation
  const handleStartSaleForClient = (clientId: string) => {
    setTargetSaleClientId(clientId);
    setActiveView('nueva-venta');
  };

  const handleNavigateToPayment = (liquidationId: string) => {
    setTargetPaymentLiqId(liquidationId);
    setActiveView('pagos');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Bar with 3-Zone Contract and quick role switcher */}
      <Navbar
        onNavigateHome={() => setScreenMode('landing')}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <Sidebar activeView={activeView} setActiveView={setActiveView} />

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {/* SUPERADMIN VIEWS */}
          {currentRole === 'superadmin' && (
            <>
              {activeView === 'admin-dashboard' && (
                <SuperadminDashboard
                  onNavigateToBazares={() => setActiveView('admin-bazares')}
                  onNavigateToAuditoria={() => setActiveView('admin-auditoria')}
                />
              )}
              {activeView === 'admin-bazares' && <BazarManagement />}
              {activeView === 'admin-usuarios' && <UserManagement />}
              {activeView === 'admin-auditoria' && <AuditLogView />}
            </>
          )}

          {/* OWNER VIEWS */}
          {currentRole === 'owner' && (
            <>
              {activeView === 'dashboard' && (
                <OwnerDashboard onNavigate={(v) => setActiveView(v)} />
              )}
              {activeView === 'clientes' && (
                <ClientList
                  onStartNewSaleForClient={handleStartSaleForClient}
                  onViewAccountForClient={(cId) => setActiveView('cuentas-corrientes')}
                />
              )}
              {activeView === 'productos' && <ProductCatalog />}
              {activeView === 'nueva-venta' && (
                <NewSaleWizard
                  initialClientId={targetSaleClientId}
                  onFinishSale={() => {
                    setTargetSaleClientId(undefined);
                    setActiveView('dashboard');
                  }}
                />
              )}
              {activeView === 'cuentas-corrientes' && (
                <AccountStatements onNavigateToPayment={handleNavigateToPayment} />
              )}
              {activeView === 'cuotas' && (
                <InstallmentLoans
                  onNavigateToPayment={(loanId, cuotaNum) => {
                    setActiveView('pagos');
                  }}
                />
              )}
              {activeView === 'pagos' && (
                <PaymentsManager
                  initialLiquidationId={targetPaymentLiqId}
                  onFinishPayment={() => {
                    setTargetPaymentLiqId(undefined);
                  }}
                />
              )}
              {activeView === 'reportes' && <FinancialReports />}
              {activeView === 'configuracion' && <FinancialConfig />}
              {activeView === 'auditoria' && <AuditLogView />}
            </>
          )}

          {/* CLIENT VIEWS */}
          {currentRole === 'client' && (
            <ClientPortal
              initialTab={
                activeView === 'client-compras'
                  ? 'compras'
                  : activeView === 'client-cuotas'
                  ? 'cuotas'
                  : activeView === 'client-pagos'
                  ? 'pagos'
                  : 'dashboard'
              }
            />
          )}
        </main>
      </div>

      {/* Global Contextual Help Modal */}
      <ContextualHelpModal />

      {/* Global Mathematical Audit Drawer */}
      <CalculationDetailDrawer />

      {/* Global Toasts */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
