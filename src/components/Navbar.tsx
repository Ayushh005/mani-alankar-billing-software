import React from 'react';
import { 
  Menu, 
  PlusCircle, 
  Calendar, 
  Coins, 
  Sparkles,
  TrendingUp,
  Receipt,
  Settings,
  LogOut
} from 'lucide-react';
import { MetalRatesSnapshot } from '../types';
import { formatCurrency } from '../utils/calculations';

interface NavbarProps {
  activeTab: 'dashboard' | 'billing' | 'history' | 'rates' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'billing' | 'history' | 'rates' | 'settings') => void;
  rates: MetalRatesSnapshot;
  onOpenMobileMenu?: () => void;
  currentUser?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  rates,
  onOpenMobileMenu,
  currentUser,
  onLogout
}) => {
  // Title and subtitle according to active tab
  const getTabHeader = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Dashboard Overview', subtitle: 'Store performance, sales revenue & pending dues' };
      case 'billing':
        return { title: 'Create GST Jewellery Bill', subtitle: 'Rule-46 Tax Invoice with Hallmark & itemized metals' };
      case 'history':
        return { title: 'Bills & Customer Ledger', subtitle: 'Invoice history, partial payment receipts & outstanding balance' };
      case 'rates':
        return { title: 'Set Metal Rates', subtitle: 'Manually configure store rates for Gold & Silver' };
      case 'settings':
        return { title: 'Shop & GST Settings', subtitle: 'Store address, GSTIN, HSN codes & invoice print styling' };
      default:
        return { title: 'Mani Alankar Jewellers', subtitle: 'Jewellery Billing Portal' };
    }
  };

  const headerInfo = getTabHeader();

  // Current formatted date
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="royal-topbar no-print">
      <div className="topbar-inner">
        
        {/* Left: Mobile Menu Toggle & Page Title */}
        <div className="topbar-left">
          <button 
            className="mobile-menu-trigger"
            onClick={onOpenMobileMenu}
            title="Open Navigation Menu"
          >
            <Menu size={22} />
          </button>
          
          <div className="topbar-title-block">
            <h1 className="topbar-page-title">{headerInfo.title}</h1>
            <span className="topbar-page-sub">{headerInfo.subtitle}</span>
          </div>
        </div>

        {/* Right: Rates Banner & Quick Actions */}
        <div className="topbar-right">
          
          {/* Manually Set Rates Display (No automatic live fetch) */}
          <div 
            className="topbar-rates-pill" 
            title="Today's Active Store Rates (Click to modify)"
            onClick={() => setActiveTab('rates')}
          >
            <div className="store-rate-badge">
              <Coins size={13} color="#e6ca65" />
              <span>STORE RATE:</span>
            </div>
            
            <div className="rate-chip">
              <span className="chip-metal">24K:</span>
              <span className="chip-price">{formatCurrency(rates.gold24k)}/g</span>
            </div>

            <div className="rate-chip gold-22k-chip">
              <span className="chip-metal">22K:</span>
              <span className="chip-price">{formatCurrency(rates.gold22k)}/g</span>
            </div>

            <div className="rate-chip">
              <span className="chip-metal">Silver:</span>
              <span className="chip-price">{formatCurrency(rates.silver)}/g</span>
            </div>
          </div>

          {/* Date Indicator */}
          <div className="topbar-date-chip">
            <Calendar size={14} color="#886226" />
            <span>{todayFormatted}</span>
          </div>

          {/* Action Group: + New Bill & Logout pinned at the top-right corner */}
          <div className="topbar-actions-group">
            <button 
              className="topbar-quick-bill-btn"
              onClick={() => setActiveTab('billing')}
              title="Create New GST Jewellery Bill"
            >
              <PlusCircle size={15} />
              <span>+ New Bill</span>
            </button>

            {onLogout && (
              <button
                className="topbar-logout-btn"
                onClick={onLogout}
                title={`Terminal Logged in as ${currentUser || 'Owner'}. Click to Logout`}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
