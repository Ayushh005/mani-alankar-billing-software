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
  subscribeToCloudInvoices,
  fetchSettingsFromCloud,
  subscribeToCloudSettings,
  subscribeToAuthState,
  signOutGoogle,
  getCurrentAuthUser
} from './firebase';

import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { BillingFormView } from './components/BillingFormView';
import { InvoiceModal } from './components/InvoiceModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { LoginPage } from './components/LoginPage';

// Code-split route components for fast startup & lightweight bundle
const DashboardView = React.lazy(() => import('./components/DashboardView').then(m => ({ default: m.DashboardView })));
const HistoryLedgerView = React.lazy(() => import('./components/HistoryLedgerView').then(m => ({ default: m.HistoryLedgerView })));
const RatesView = React.lazy(() => import('./components/RatesView').then(m => ({ default: m.RatesView })));
const SettingsView = React.lazy(() => import('./components/SettingsView').then(m => ({ default: m.SettingsView })));

const ViewLoader: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', flexDirection: 'column', gap: '0.8rem' }}>
    <div style={{ width: '32px', height: '32px', border: '3px solid #ebdcc5', borderTopColor: '#c59b48', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <span style={{ fontSize: '0.82rem', color: '#886226', fontWeight: 700 }}>Loading Module...</span>
  </div>
);

export const App: React.FC = () => {
  // Cryptographically verified Google User session (immune to DevTools localStorage tampering)
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'billing' | 'history' | 'rates' | 'settings'>('dashboard');
  const [settings, setSettings] = useState<ShopSettings>(() => getShopSettings());
  const [invoices, setInvoices] = useState<Invoice[]>(() => getInvoices());
  const [rates, setRates] = useState<MetalRatesSnapshot>(() => getSavedRates());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Modals
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isDraftInvoice, setIsDraftInvoice] = useState<boolean>(false);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  // Real-time Cloud Invoices Subscription with safe deduplication
  useEffect(() => {
    const unsubscribe = subscribeToCloudInvoices((cloudInvoices) => {
      if (cloudInvoices && cloudInvoices.length > 0) {
        setInvoices(currentInvoices => {
          const map = new Map<string, Invoice>();
          // Insert cloud invoices
          cloudInvoices.forEach(inv => {
            if (inv && inv.id) map.set(inv.id, inv);
          });
          // Preserve any local invoice not yet seen by cloud
          currentInvoices.forEach(inv => {
            if (inv && inv.id && !map.has(inv.id)) {
              map.set(inv.id, inv);
            }
          });
          const merged = Array.from(map.values());
          merged.sort((a, b) => {
            const timeA = new Date(a.createdAt || a.invoiceDate).getTime() || 0;
            const timeB = new Date(b.createdAt || b.invoiceDate).getTime() || 0;
            return timeB - timeA;
          });
          saveInvoices(merged);
          return merged;
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Real-time Cloud Settings & Whitelist Subscription
  useEffect(() => {
    const unsubscribe = subscribeToCloudSettings((cloudSettings) => {
      if (cloudSettings) {
        setSettings(prev => {
          const merged = { ...prev, ...cloudSettings };
          saveShopSettings(merged);
          return merged;
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Prevent mouse wheel from inadvertently changing number inputs
  useEffect(() => {
    const handleWheel = () => {
      if (document.activeElement?.tagName === 'INPUT' && (document.activeElement as HTMLInputElement).type === 'number') {
        (document.activeElement as HTMLElement).blur();
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Sync settings on mount/login
  useEffect(() => {
    fetchSettingsFromCloud().then((cloudSettings) => {
      if (cloudSettings) {
        setSettings(prev => {
          const merged = { ...prev, ...cloudSettings };
          saveShopSettings(merged);
          return merged;
        });
      }
    }).catch(err => console.warn('Cloud settings fetch notice:', err));
  }, [currentUser]);

  // Cryptographic Authentication State Guardian
  // Prevents any Chrome DevTools / LocalStorage tampering bypass
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      if (!firebaseUser || !firebaseUser.email) {
        // No valid cryptographic Google session exists
        localStorage.removeItem('mani_alankar_auth_user');
        setCurrentUser(null);
        setAuthChecking(false);
        return;
      }

      const verifiedEmail = firebaseUser.email.toLowerCase().trim();

      // Check authoritative whitelist from Cloud Settings or local fallback
      let allowed = false;
      try {
        const cloudSettings = await fetchSettingsFromCloud();
        const primaryOwnerEmail = 'manialankar3@gmail.com';
        const allowedEmails: string[] = Array.from(new Set([
          primaryOwnerEmail,
          'ayushofficial2323@gmail.com',
          ...(cloudSettings?.authorizedGmails || []),
          cloudSettings?.authorizedGmail || '',
          cloudSettings?.email || '',
          ...(settings.authorizedGmails || []),
          settings.authorizedGmail || '',
          settings.email || ''
        ])).map(e => e.trim().toLowerCase()).filter(Boolean);

        allowed = allowedEmails.includes(verifiedEmail);
      } catch (err) {
        console.warn('Could not verify against cloud whitelist, checking local config:', err);
        const allowedEmails: string[] = Array.from(new Set([
          'manialankar3@gmail.com',
          'ayushofficial2323@gmail.com',
          ...(settings.authorizedGmails || []),
          settings.authorizedGmail || '',
          settings.email || ''
        ])).map(e => e.trim().toLowerCase()).filter(Boolean);
        allowed = allowedEmails.includes(verifiedEmail);
      }

      if (allowed) {
        localStorage.setItem('mani_alankar_auth_user', verifiedEmail);
        setCurrentUser(verifiedEmail);
      } else {
        console.warn(`Unauthorized Google account: ${verifiedEmail}. Revoking session.`);
        await signOutGoogle();
        localStorage.removeItem('mani_alankar_auth_user');
        setCurrentUser(null);
      }

      setAuthChecking(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [settings.authorizedGmails]);

  // Active session security: If currentUser is removed from whitelist by owner, immediately kick/logout!
  useEffect(() => {
    if (!currentUser) return;
    const allowed = Array.from(new Set([
      'manialankar3@gmail.com',
      'ayushofficial2323@gmail.com',
      ...(settings.authorizedGmails || []),
      settings.authorizedGmail || '',
      settings.email || ''
    ])).map(e => e.trim().toLowerCase()).filter(Boolean);

    if (!allowed.includes(currentUser.toLowerCase().trim())) {
      console.warn(`User ${currentUser} is no longer in the whitelist. Logging out.`);
      handleLogout();
    }
  }, [currentUser, settings.authorizedGmails]);

  // Continuous anti-tamper monitor: Terminate session if state is spoofed via DevTools
  useEffect(() => {
    if (currentUser) {
      const liveUser = getCurrentAuthUser();
      if (!liveUser || !liveUser.email || liveUser.email.toLowerCase().trim() !== currentUser.toLowerCase().trim()) {
        console.warn('Tampering detected: React session does not match cryptographic Google token.');
        handleLogout();
      }
    }
  }, [activeTab, currentUser]);

  // Authentication Handlers
  const handleLoginSuccess = (email: string) => {
    localStorage.setItem('mani_alankar_auth_user', email);
    setCurrentUser(email);
  };

  const handleLogout = async () => {
    try {
      await signOutGoogle();
    } catch (e) {
      console.warn('Logout notice:', e);
    }
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

  // While verifying cryptographic Google session on boot
  if (authChecking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#220308', flexDirection: 'column', gap: '1rem', color: '#f7e7be' }}>
        <div style={{ width: '42px', height: '42px', border: '3px solid #6b1b29', borderTopColor: '#c59b48', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em' }}>Verifying Authorized Session...</span>
      </div>
    );
  }

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
          <React.Suspense fallback={<ViewLoader />}>
            {activeTab === 'dashboard' && (
              <DashboardView 
                invoices={invoices}
                rates={rates}
                onNewBillClick={() => setActiveTab('billing')}
                onViewInvoice={(inv) => {
                  setViewingInvoice(inv);
                  setIsDraftInvoice(false);
                }}
                onRecordPaymentClick={(inv) => setPayingInvoice(inv)}
              />
            )}

            {activeTab === 'billing' && (
              <BillingFormView 
                rates={rates}
                settings={settings}
                existingInvoices={invoices}
                onSaveInvoice={(inv) => handleSaveInvoice(inv, false)}
                onPreviewDraftInvoice={(inv) => {
                  setViewingInvoice(inv);
                  setIsDraftInvoice(true);
                }}
              />
            )}

            {activeTab === 'history' && (
              <HistoryLedgerView 
                invoices={invoices}
                onViewInvoice={(inv) => {
                  setViewingInvoice(inv);
                  setIsDraftInvoice(false);
                }}
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
          </React.Suspense>
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
          isDraft={isDraftInvoice}
          onClose={() => {
            setViewingInvoice(null);
            setIsDraftInvoice(false);
          }}
          onConfirmSaveDraft={(inv) => {
            handleSaveInvoice(inv, false);
            setIsDraftInvoice(false);
          }}
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
