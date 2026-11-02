import React, { useState } from 'react';
import { 
  TrendingUp, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  PlusCircle, 
  Clock, 
  Printer, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Invoice, MetalRatesSnapshot } from '../types';
import { formatCurrency } from '../utils/calculations';

interface DashboardViewProps {
  invoices: Invoice[];
  rates: MetalRatesSnapshot;
  onNewBillClick: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onRecordPaymentClick: (invoice: Invoice) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  invoices,
  rates,
  onNewBillClick,
  onViewInvoice,
  onRecordPaymentClick
}) => {
  // Compute metrics
  const totalInvoicesCount = invoices.length;
  const totalSalesVolume = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  const pendingInvoices = invoices.filter(inv => inv.balanceDue > 0);

  // Pagination states (15 items per page)
  const [invoicesPage, setInvoicesPage] = useState<number>(1);
  const invoicesPerPage = 15;
  const totalInvoicePages = Math.ceil(invoices.length / invoicesPerPage) || 1;
  const paginatedInvoices = invoices.slice((invoicesPage - 1) * invoicesPerPage, invoicesPage * invoicesPerPage);

  const [pendingPage, setPendingPage] = useState<number>(1);
  const pendingPerPage = 15;
  const totalPendingPages = Math.ceil(pendingInvoices.length / pendingPerPage) || 1;
  const paginatedPending = pendingInvoices.slice((pendingPage - 1) * pendingPerPage, pendingPage * pendingPerPage);

  return (
    <div className="dashboard-container">
      
      {/* Welcome Banner */}
      <div className="dashboard-welcome-banner">
        <div className="welcome-text-block">
          <div className="welcome-tag">
            <Sparkles size={15} /> Official Jewellery Billing Portal
          </div>
          <h2 className="welcome-title">
            Welcome to Mani Alankar Jewellers
          </h2>
          <p className="welcome-subtitle">
            GST Rule-46 compliant jewellery billing with automated gold & silver rate calculation, making charges, and real-time customer outstanding payment tracking.
          </p>
        </div>

        <button 
          className="btn-royal-gold welcome-cta-btn"
          onClick={onNewBillClick}
        >
          <PlusCircle size={18} />
          <span>Create New Bill</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        {/* Metric 1: Total Sales */}
        <div className="metric-card" style={{ '--card-accent': '#c59b48' } as any}>
          <div className="metric-info">
            <h4>Total Billed Revenue</h4>
            <div className="metric-value">{formatCurrency(totalSalesVolume)}</div>
            <div className="metric-sub">{totalInvoicesCount} invoices recorded</div>
          </div>
          <div className="metric-icon-wrap" style={{ '--icon-bg': '#fcf8ee', '--icon-color': '#c59b48' } as any}>
            <TrendingUp size={22} />
          </div>
        </div>

        {/* Metric 2: Total Collected */}
        <div className="metric-card" style={{ '--card-accent': '#15803d' } as any}>
          <div className="metric-info">
            <h4>Total Cash / UPI Received</h4>
            <div className="metric-value" style={{ color: '#15803d' }}>
              {formatCurrency(totalCollected)}
            </div>
            <div className="metric-sub">Cleared into account</div>
          </div>
          <div className="metric-icon-wrap" style={{ '--icon-bg': '#ecfdf5', '--icon-color': '#15803d' } as any}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Metric 3: Total Outstanding Balance */}
        <div className="metric-card" style={{ '--card-accent': '#b91c1c' } as any}>
          <div className="metric-info">
            <h4>Customer Outstanding (Due)</h4>
            <div className="metric-value" style={{ color: '#b91c1c' }}>
              {formatCurrency(totalOutstanding)}
            </div>
            <div className="metric-sub">{pendingInvoices.length} bills with pending dues</div>
          </div>
          <div className="metric-icon-wrap" style={{ '--icon-bg': '#fef2f2', '--icon-color': '#b91c1c' } as any}>
            <AlertCircle size={22} />
          </div>
        </div>

        {/* Metric 4: Daily Rates */}
        <div className="metric-card" style={{ '--card-accent': '#886226' } as any}>
          <div className="metric-info">
            <h4>Today's 22K (916) Gold</h4>
            <div className="metric-value" style={{ color: '#a97e33' }}>
              {formatCurrency(rates.gold22k)}/g
            </div>
            <div className="metric-sub">Fine Silver: {formatCurrency(rates.silver)}/g</div>
          </div>
          <div className="metric-icon-wrap" style={{ '--icon-bg': '#fbf5e6', '--icon-color': '#a97e33' } as any}>
            <Sparkles size={22} />
          </div>
        </div>
      </div>

      {/* Grid: 1. Recent Invoices (LEFT) & 2. Pending Dues (RIGHT) */}
      <div className="dashboard-split-grid">
        
        {/* Left Column (Primary): Recent Jewellery Invoices */}
        <div className="royal-card dashboard-invoices-card">
          <div className="royal-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="#3f0913" />
              <h3 className="royal-card-title">Recent Jewellery Invoices</h3>
            </div>
            
            {/* Header Pagination Controls */}
            <div className="card-pagination-controls">
              <span className="pagination-count-label">
                Page {invoicesPage} of {totalInvoicePages} ({invoices.length} bills)
              </span>
              <div className="pagination-arrow-btns">
                <button
                  type="button"
                  className="page-nav-btn"
                  disabled={invoicesPage <= 1}
                  onClick={() => setInvoicesPage(p => Math.max(1, p - 1))}
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  className="page-nav-btn"
                  disabled={invoicesPage >= totalInvoicePages}
                  onClick={() => setInvoicesPage(p => Math.min(totalInvoicePages, p + 1))}
                  title="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="royal-card-body" style={{ padding: 0 }}>
            
            {/* Desktop Table View (No Horizontal Scroll, All Columns Fit) */}
            <div className="desktop-dashboard-table-wrap">
              <table className="dashboard-invoices-table">
                <thead>
                  <tr>
                    <th style={{ width: '18%' }}>Invoice No</th>
                    <th style={{ width: '22%' }}>Customer</th>
                    <th style={{ width: '12%' }}>Date</th>
                    <th style={{ width: '15%' }}>Grand Total</th>
                    <th style={{ width: '13%' }}>Balance</th>
                    <th style={{ width: '10%' }}>Status</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <strong className="invoice-no-text">{inv.invoiceNumber}</strong>
                      </td>
                      <td>
                        <div className="customer-cell-name">{inv.customer.name}</div>
                        <div className="customer-cell-mobile">{inv.customer.mobile}</div>
                      </td>
                      <td className="date-cell">{inv.invoiceDate}</td>
                      <td>
                        <strong className="amount-cell-bold">{formatCurrency(inv.grandTotal)}</strong>
                      </td>
                      <td>
                        {inv.balanceDue > 0 ? (
                          <span className="balance-due-text">
                            {formatCurrency(inv.balanceDue)}
                          </span>
                        ) : (
                          <span className="balance-cleared-text">Cleared</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${inv.status.toLowerCase()}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="action-buttons-group">
                          <button
                            type="button"
                            className="btn-royal-outline btn-sm action-bill-btn"
                            title="View / Print Tax Invoice"
                            onClick={() => onViewInvoice(inv)}
                          >
                            <Printer size={13} />
                            <span>Bill</span>
                          </button>
                          {inv.balanceDue > 0 && (
                            <button
                              type="button"
                              className="btn-royal-primary btn-sm action-pay-btn"
                              title="Record Customer Payment"
                              onClick={() => onRecordPaymentClick(inv)}
                            >
                              + Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Responsive Invoice Cards (No horizontal overflow) */}
            <div className="mobile-dashboard-cards-wrap">
              {paginatedInvoices.map((inv) => (
                <div key={inv.id} className="mobile-invoice-card-item">
                  <div className="mobile-invoice-header">
                    <div>
                      <strong className="invoice-no-text">{inv.invoiceNumber}</strong>
                      <span className="mobile-invoice-date">{inv.invoiceDate}</span>
                    </div>
                    <span className={`badge badge-${inv.status.toLowerCase()}`}>
                      {inv.status}
                    </span>
                  </div>

                  <div className="mobile-invoice-customer">
                    <strong>{inv.customer.name}</strong>
                    <span className="customer-cell-mobile"> &bull; {inv.customer.mobile}</span>
                  </div>

                  <div className="mobile-invoice-amounts-row">
                    <div>
                      <span className="sub-label">Total: </span>
                      <strong>{formatCurrency(inv.grandTotal)}</strong>
                    </div>
                    <div>
                      <span className="sub-label">Due: </span>
                      {inv.balanceDue > 0 ? (
                        <span className="balance-due-text">{formatCurrency(inv.balanceDue)}</span>
                      ) : (
                        <span className="balance-cleared-text">Cleared</span>
                      )}
                    </div>
                  </div>

                  <div className="mobile-invoice-actions">
                    <button
                      type="button"
                      className="btn-royal-outline btn-sm mobile-action-btn"
                      onClick={() => onViewInvoice(inv)}
                    >
                      <Printer size={13} /> View Bill
                    </button>
                    {inv.balanceDue > 0 && (
                      <button
                        type="button"
                        className="btn-royal-primary btn-sm mobile-action-btn"
                        onClick={() => onRecordPaymentClick(inv)}
                      >
                        + Record Payment
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Footer */}
            <div className="card-pagination-footer">
              <span style={{ fontSize: '0.78rem', color: '#666' }}>
                Showing {(invoicesPage - 1) * invoicesPerPage + 1} - {Math.min(invoicesPage * invoicesPerPage, invoices.length)} of {invoices.length} invoices
              </span>
              <div className="pagination-arrow-btns">
                <button
                  type="button"
                  className="page-nav-btn"
                  disabled={invoicesPage <= 1}
                  onClick={() => setInvoicesPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <button
                  type="button"
                  className="page-nav-btn"
                  disabled={invoicesPage >= totalInvoicePages}
                  onClick={() => setInvoicesPage(p => Math.min(totalInvoicePages, p + 1))}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column (Secondary): Pending Payments & Dues */}
        <div className="royal-card dashboard-dues-card">
          <div className="royal-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#b45309" />
              <h3 className="royal-card-title">
                Pending Payments & Dues ({pendingInvoices.length})
              </h3>
            </div>

            {/* Pagination controls */}
            {totalPendingPages > 1 && (
              <div className="pagination-arrow-btns">
                <button
                  type="button"
                  className="page-nav-btn"
                  disabled={pendingPage <= 1}
                  onClick={() => setPendingPage(p => Math.max(1, p - 1))}
                  title="Previous Dues Page"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  className="page-nav-btn"
                  disabled={pendingPage >= totalPendingPages}
                  onClick={() => setPendingPage(p => Math.min(totalPendingPages, p + 1))}
                  title="Next Dues Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="royal-card-body" style={{ padding: '0.85rem' }}>
            {pendingInvoices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#15803d' }}>
                <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem auto' }} />
                <p style={{ fontWeight: 700, margin: 0 }}>All accounts 100% cleared!</p>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>No outstanding dues pending.</span>
              </div>
            ) : (
              <div className="pending-dues-scroll-container">
                {paginatedPending.map((inv) => (
                  <div key={inv.id} className="pending-due-item-card">
                    <div className="pending-due-top-row">
                      <div className="pending-customer-name">
                        <strong>{inv.customer.name}</strong>
                        <span className={`badge ${inv.status === 'PARTIAL' ? 'badge-partial' : 'badge-unpaid'}`}>
                          {inv.status}
                        </span>
                      </div>
                      <div className="pending-due-amount">
                        {formatCurrency(inv.balanceDue)}
                      </div>
                    </div>

                    <div className="pending-due-meta-row">
                      <div className="pending-meta-text">
                        <div>Bill: {inv.invoiceNumber}</div>
                        <div>Paid: {formatCurrency(inv.amountPaid)} / Total: {formatCurrency(inv.grandTotal)}</div>
                      </div>
                      
                      <button
                        type="button"
                        className="btn-royal-primary btn-sm pending-collect-btn"
                        onClick={() => onRecordPaymentClick(inv)}
                      >
                        + Collect ₹
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Dues Pagination Footer */}
            {totalPendingPages > 1 && (
              <div className="card-pagination-footer" style={{ borderTop: '1px solid #ebdcc5', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#666' }}>
                  Page {pendingPage} of {totalPendingPages} ({pendingInvoices.length} dues)
                </span>
                <div className="pagination-arrow-btns">
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={pendingPage <= 1}
                    onClick={() => setPendingPage(p => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={pendingPage >= totalPendingPages}
                    onClick={() => setPendingPage(p => Math.min(totalPendingPages, p + 1))}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
