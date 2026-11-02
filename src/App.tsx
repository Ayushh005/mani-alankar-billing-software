import React, { useState, useEffect } from 'react';
import './App.css';
import { Invoice, MetalRatesSnapshot, PaymentMethod, ShopSettings } from './types';
import { 
  getShopSettings, 
  saveShopSettings, 
  getInvoices, 
  saveInvoices,
  addInvoice, 
  recordPaymentOnInvoice 
} from './utils/storage';
import { 
  getSavedRates, 
  saveRates 
} from './utils/rates';
import { 
  syncInvoiceToCloud, 
  syncSettingsToCloud, 
  syncRatesToCloud, 
  subscribeToCloudInvoices 
} from './firebase';

import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { BillingFormView } from './components/BillingFormView';
import { HistoryLedgerView } from './components/HistoryLedgerView';
import { RatesView } from './components/RatesView';
import { SettingsView } from './components/SettingsView';
import { InvoiceModal } from './components/InvoiceModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { LoginPage } from './components/LoginPage';

export const App: React.FC = () => {
  // Authentication State (Restricted to authorized Gmail accounts)
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('mani_alankar_auth_user');
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'billing' | 'history' | 'rates' | 'settings'>('dashboard');
  const [settings, setSettings] = useState<ShopSettings>(() => getShopSettings());
  const [invoices, setInvoices] = useState<Invoice[]>(() => getInvoices());
  const [rates, setRates] = useState<MetalRatesSnapshot>(() => getSavedRates());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Modals
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  // Real-time Cloud Invoices Subscription
  useEffect(() => {
    const unsubscribe = subscribeToCloudInvoices((cloudInvoices) => {
      if (cloudInvoices && cloudInvoices.length > 0) {
        saveInvoices(cloudInvoices);
        setInvoices(cloudInvoices);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Authentication Handlers
  const handleLoginSuccess = (email: string) => {
    localStorage.setItem('mani_alankar_auth_user', email);
    setCurrentUser(email);
  };

  const handleLogout = () => {
    localStorage.removeItem('mani_alankar_auth_user');
    setCurrentUser(null);
  };

  // Add new email to authorized whitelist
  const handleUpdateAuthorizedGmail = (newEmail: string) => {
    const clean = newEmail.trim().toLowerCase();
    const currentList = settings.authorizedGmails || ['manialankar3@gmail.com'];
    const updatedList = Array.from(new Set([...currentList, clean]));
    const updated = { 
      ...settings, 
      authorizedGmail: 'manialankar3@gmail.com',
      authorizedGmails: updatedList 
    };
    handleSaveSettings(updated);
  };

  // Sync settings when updated
  const handleSaveSettings = (newSettings: ShopSettings) => {
    setSettings(newSettings);
    saveShopSettings(newSettings);
    syncSettingsToCloud(newSettings).catch(err => console.warn('Cloud settings sync notice:', err));
  };

  // Sync rates when updated (Manual set)
  const handleUpdateRates = (newRates: MetalRatesSnapshot) => {
    setRates(newRates);
    saveRates(newRates);
    syncRatesToCloud(newRates).catch(err => console.warn('Cloud rates sync notice:', err));
  };

  // New bill creation
  const handleSaveInvoice = (newInvoice: Invoice, openPreview: boolean = true) => {
    addInvoice(newInvoice);
    const updated = getInvoices();
    setInvoices(updated);
    setSettings(getShopSettings());

    // Mirror to Google Cloud Firestore
    syncInvoiceToCloud(newInvoice).catch(err => console.warn('Cloud invoice sync notice:', err));

    if (openPreview) {
      setViewingInvoice(newInvoice);
    } else {
      setActiveTab('history');
    }
  };

  // Partial Payment handler
  const handlePaymentSuccess = (
    invoiceId: string, 
    amount: number, 
    method: PaymentMethod, 
    ref?: string, 
    notes?: string
  ) => {
    const updated = recordPaymentOnInvoice(invoiceId, amount, method, ref, notes);
    if (updated) {
      setInvoices(getInvoices());
      setViewingInvoice(updated);
      // Mirror updated ledger to Google Cloud Firestore
      syncInvoiceToCloud(updated).catch(err => console.warn('Cloud payment sync notice:', err));
    }
  };

  // Factory reset to initial seed data
  const handleDatabaseReset = () => {
    localStorage.clear();
    setSettings(getShopSettings());
    setInvoices(getInvoices());
    setRates(getSavedRates());
    setActiveTab('dashboard');
  };

  // If not authenticated, render restricted Login Screen
  if (!currentUser) {
    return (
      <LoginPage 
        settings={settings}
        onLoginSuccess={handleLoginSuccess}
        onUpdateAuthorizedGmail={handleUpdateAuthorizedGmail}
      />
    );
  }

  // Count of invoices with pending balances
  const pendingCount = invoices.filter(inv => inv.balanceDue > 0).length;

  return (
    <div className="app-shell">
      
      {/* Modern Left Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        rates={rates}
        pendingCount={pendingCount}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main App Layout (Top bar + Page Content + Footer) */}
      <div className="app-main-layout">
        
        {/* Top Header with Breadcrumbs, Date & Active Rates Pill */}
        <Navbar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          rates={rates}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Dynamic Page Views */}
        <main className="main-content">
          {activeTab === 'dashboard' && (
            <DashboardView 
              invoices={invoices}
              rates={rates}
              onNewBillClick={() => setActiveTab('billing')}
              onViewInvoice={(inv) => setViewingInvoice(inv)}
              onRecordPaymentClick={(inv) => setPayingInvoice(inv)}
            />
          )}

          {activeTab === 'billing' && (
            <BillingFormView 
              rates={rates}
              settings={settings}
              existingInvoices={invoices}
              onSaveInvoice={handleSaveInvoice}
            />
          )}

          {activeTab === 'history' && (
            <HistoryLedgerView 
              invoices={invoices}
              onViewInvoice={(inv) => setViewingInvoice(inv)}
              onRecordPaymentClick={(inv) => setPayingInvoice(inv)}
            />
          )}

          {activeTab === 'rates' && (
            <RatesView 
              rates={rates}
              onUpdateRates={handleUpdateRates}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView 
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onDatabaseReset={handleDatabaseReset}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="no-print royal-footer">
          <div className="royal-footer-inner">
            <div>
              <strong>{settings.shopName}</strong> &bull; {settings.address}, {settings.city} &bull; Ph: {settings.phone}
            </div>
            <div>
              BIS Hallmark Certified &bull; GSTIN: {settings.gstin}
            </div>
            <div style={{ color: '#e6ca65' }}>
              Jewellery Billing & GST Invoice Management System v2.0
            </div>
          </div>
        </footer>

      </div>

      {/* Tax Invoice Modal (Print / Thermal / Share) */}
      {viewingInvoice && (
        <InvoiceModal 
          invoice={viewingInvoice}
          settings={settings}
          onClose={() => setViewingInvoice(null)}
          onRecordPaymentClick={(inv) => setPayingInvoice(inv)}
        />
      )}

      {/* Record Payment / Outstanding Installment Modal */}
      {payingInvoice && (
        <RecordPaymentModal 
          invoice={payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

    </div>
  );
};

export default App;
