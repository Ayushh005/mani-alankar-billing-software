import React from 'react';
import { 
  TrendingUp, 
  PlusCircle, 
  Receipt, 
  Sparkles, 
  Settings, 
  X,
  Coins,
  ChevronRight,
  ShieldCheck,
  Building2,
  LogOut
} from 'lucide-react';
import { MetalRatesSnapshot } from '../types';
import { formatCurrency } from '../utils/calculations';

interface SidebarProps {
  activeTab: 'dashboard' | 'billing' | 'history' | 'rates' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'billing' | 'history' | 'rates' | 'settings') => void;
  rates: MetalRatesSnapshot;
  pendingCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentUser?: string;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  rates,
  pendingCount,
  isOpenMobile,
  onCloseMobile,
  currentUser,
  onLogout
}) => {
  const handleNavClick = (tab: 'dashboard' | 'billing' | 'history' | 'rates' | 'settings') => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          className="sidebar-backdrop no-print" 
          onClick={onCloseMobile}
        />
      )}

      <aside className={`royal-sidebar no-print ${isOpenMobile ? 'mobile-open' : ''}`}>
        
        {/* Brand Header */}
        <div className="sidebar-brand-container">
          <div className="sidebar-brand" onClick={() => handleNavClick('dashboard')}>
            <img 
              src="/mani_alankar_logo.jpg" 
              alt="Mani Alankar Jewellers" 
              className="sidebar-logo-img" 
            />
            <div className="sidebar-brand-text">
              <h2>MANI ALANKAR</h2>
              <span>JEWELLERS &bull; GST BILLING</span>
            </div>
          </div>
          <button 
            className="sidebar-close-btn"
            onClick={onCloseMobile}
            title="Close Menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick CTA Button: + Create New Bill */}
        <div className="sidebar-cta-wrap">
          <button 
            className="sidebar-cta-btn"
            onClick={() => handleNavClick('billing')}
          >
            <PlusCircle size={18} />
            <span>Create New Bill</span>
          </button>
        </div>

        {/* Navigation Section */}
        <div className="sidebar-nav-section">
          <div className="sidebar-section-title">MAIN MENU</div>
          <nav className="sidebar-nav">
            
            <button 
              className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('dashboard')}
            >
              <div className="sidebar-nav-icon">
                <TrendingUp size={18} />
              </div>
              <span className="sidebar-nav-label">Dashboard</span>
              {activeTab === 'dashboard' && <ChevronRight size={14} className="active-arrow" />}
            </button>

            <button 
              className={`sidebar-nav-item ${activeTab === 'billing' ? 'active' : ''}`}
              onClick={() => handleNavClick('billing')}
            >
              <div className="sidebar-nav-icon">
                <PlusCircle size={18} />
              </div>
              <span className="sidebar-nav-label">New Billing</span>
              {activeTab === 'billing' && <ChevronRight size={14} className="active-arrow" />}
            </button>

            <button 
              className={`sidebar-nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => handleNavClick('history')}
            >
              <div className="sidebar-nav-icon">
                <Receipt size={18} />
              </div>
              <span className="sidebar-nav-label">Bills & Ledger</span>
              {activeTab === 'history' && <ChevronRight size={14} className="active-arrow" />}
            </button>

            <button 
              className={`sidebar-nav-item ${activeTab === 'rates' ? 'active' : ''}`}
              onClick={() => handleNavClick('rates')}
            >
              <div className="sidebar-nav-icon">
                <Sparkles size={18} />
              </div>
              <span className="sidebar-nav-label">Set Metal Rates</span>
              {activeTab === 'rates' && <ChevronRight size={14} className="active-arrow" />}
            </button>

            <button 
              className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleNavClick('settings')}
            >
              <div className="sidebar-nav-icon">
                <Settings size={18} />
              </div>
              <span className="sidebar-nav-label">Shop Settings</span>
              {activeTab === 'settings' && <ChevronRight size={14} className="active-arrow" />}
            </button>

          </nav>
        </div>

        {/* Today's Manual Set Rates Widget at the bottom */}
        <div className="sidebar-rates-widget">
          <div className="sidebar-rates-header">
            <div className="sidebar-rates-title">
              <Coins size={14} color="#e6ca65" />
              <span>Today's Set Rates</span>
            </div>
            <button 
              className="sidebar-rates-edit-link" 
              onClick={() => handleNavClick('rates')}
              title="Change store rates manually"
            >
              Edit
            </button>
          </div>

          <div className="sidebar-rate-row">
            <span className="rate-name">Gold 24K</span>
            <span className="rate-price">{formatCurrency(rates.gold24k)}/g</span>
          </div>
          <div className="sidebar-rate-row highlight">
            <span className="rate-name">Gold 22K (916)</span>
            <span className="rate-price">{formatCurrency(rates.gold22k)}/g</span>
          </div>
          <div className="sidebar-rate-row">
            <span className="rate-name">Silver</span>
            <span className="rate-price">{formatCurrency(rates.silver)}/g</span>
          </div>

          <div className="sidebar-rates-note">
            <ShieldCheck size={12} color="#4ade80" />
            <span>Manually configured store rate</span>
          </div>
        </div>

        {/* Footer info in sidebar */}
        <div className="sidebar-footer">
          {currentUser && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '8px',
              padding: '0.45rem 0.65rem',
              marginBottom: '0.65rem',
              border: '1px solid rgba(197, 155, 72, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.4rem'
            }}>
              <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: '0.62rem', color: '#86efac', fontWeight: 700, display: 'block' }}>● AUTHORISED USER</span>
                <span style={{ fontSize: '0.7rem', color: '#f7e7be', fontFamily: 'var(--font-mono)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={currentUser}>
                  {currentUser}
                </span>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="Logout of Terminal"
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    borderRadius: '5px',
                    padding: '3px 7px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.68rem',
                    fontWeight: 700
                  }}
                >
                  <LogOut size={11} />
                  <span>Logout</span>
                </button>
              )}
            </div>
          )}
          <div className="sidebar-footer-text">
            <strong>Mani Alankar Jewellers</strong>
            <small>BIS Hallmark &bull; GST Rule-46</small>
          </div>
        </div>

      </aside>
    </>
  );
};
