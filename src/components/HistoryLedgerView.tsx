import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '../types';
import { formatCurrency, formatGrams } from '../utils/calculations';

// Helper to format ISO YYYY-MM-DD to Indian DD/MM/YYYY
const formatDateDDMMYYYY = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

interface HistoryLedgerViewProps {
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
  onRecordPaymentClick: (invoice: Invoice) => void;
}

export const HistoryLedgerView: React.FC<HistoryLedgerViewProps> = ({
  invoices,
  onViewInvoice,
  onRecordPaymentClick
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InvoiceStatus>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter invoices
  const filtered = invoices.filter(inv => {
    // Search match
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      inv.invoiceNumber.toLowerCase().includes(term) ||
      inv.customer.name.toLowerCase().includes(term) ||
      inv.customer.mobile.includes(term) ||
      inv.customer.city.toLowerCase().includes(term);

    // Status filter
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;

    // Date range
    const matchesStart = !startDate || inv.invoiceDate >= startDate;
    const matchesEnd = !endDate || inv.invoiceDate <= endDate;

    return matchesSearch && matchesStatus && matchesStart && matchesEnd;
  });

  // 15 items per page pagination
  const itemsPerPage = 15;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedInvoices = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Calculate totals for filtered set
  const filteredTotal = filtered.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const filteredPaid = filtered.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const filteredDue = filtered.reduce((sum, inv) => sum + inv.balanceDue, 0);

  // Export to CSV for Accountant / CA
  const exportCSV = () => {
    const headers = [
      'Invoice No',
      'Date',
      'Customer Name',
      'Mobile',
      'City',
      'Customer GSTIN',
      'Items Count',
      'Taxable Value',
      'CGST (1.5%)',
      'SGST (1.5%)',
      'IGST (3%)',
      'Total GST (3%)',
      'Grand Total',
      'Amount Received',
      'Balance Due',
      'Payment Status'
    ];

    const rows = filtered.map(inv => [
      inv.invoiceNumber,
      inv.invoiceDate,
      `"${inv.customer.name}"`,
      inv.customer.mobile,
      `"${inv.customer.city}"`,
      inv.customer.gstin || '',
      inv.items.length,
      inv.taxableAmount,
      inv.cgstAmount,
      inv.sgstAmount,
      inv.igstAmount,
      inv.totalGst,
      inv.grandTotal,
      inv.amountPaid,
      inv.balanceDue,
      inv.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mani_Alankar_GST_Bills_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      
      {/* Header and Summary Ribbon */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#3f0913', margin: 0 }}>
            Billing History & Customer Ledger
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#666', margin: '3px 0 0 0' }}>
            Permanent database of all jewellery tax invoices, historical rate locks, and payment records.
          </p>
        </div>

        <button 
          className="btn-royal-outline" 
          onClick={exportCSV}
          title="Export CSV for CA / Accountant"
        >
          <FileSpreadsheet size={16} /> Export CA Report (CSV)
        </button>
      </div>

      {/* Summary KPI Cards for Current Filter */}
      <div className="metrics-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="metric-card" style={{ '--card-accent': '#c59b48' } as any}>
          <div className="metric-info">
            <h4>Billed Amount</h4>
            <div className="metric-value">{formatCurrency(filteredTotal)}</div>
            <div className="metric-sub">{filtered.length} matching bills</div>
          </div>
        </div>

        <div className="metric-card" style={{ '--card-accent': '#15803d' } as any}>
          <div className="metric-info">
            <h4>Cleared & Received</h4>
            <div className="metric-value" style={{ color: '#15803d' }}>
              {formatCurrency(filteredPaid)}
            </div>
            <div className="metric-sub">Received via Cash/UPI/Card</div>
          </div>
        </div>

        <div className="metric-card" style={{ '--card-accent': '#b91c1c' } as any}>
          <div className="metric-info">
            <h4>Outstanding Balance (Due)</h4>
            <div className="metric-value" style={{ color: '#b91c1c' }}>
              {formatCurrency(filteredDue)}
            </div>
            <div className="metric-sub">Pending customer collection</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="royal-card" style={{ marginBottom: '1.5rem' }}>
        <div className="royal-card-body" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(3, 1fr)', gap: '1rem', alignItems: 'center' }}>
            
            {/* Search Input */}
            <div className="input-with-symbol">
              <span className="input-symbol-prefix">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="Search by Bill No, Customer Name, Mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="PAID">Fully Paid</option>
                <option value="PARTIAL">Partially Paid (Pending)</option>
                <option value="UNPAID">Unpaid (Full Due)</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                title="From Date"
              />
            </div>

            {/* End Date */}
            <div>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                title="To Date"
              />
            </div>

          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="royal-card">
        <div className="royal-card-body" style={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#777' }}>
              <AlertCircle size={38} color="#dfc794" style={{ margin: '0 auto 0.6rem auto' }} />
              <h4>No invoices found matching criteria</h4>
              <p style={{ fontSize: '0.85rem' }}>Try modifying search term, status filter or date range.</p>
            </div>
          ) : (
            <div className="items-table-wrap" style={{ border: 'none', margin: 0, overflowX: 'auto' }}>
              <table className="items-table ledger-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '13%', whiteSpace: 'nowrap' }}>Invoice No</th>
                    <th style={{ width: '9%', whiteSpace: 'nowrap' }}>Date</th>
                    <th style={{ width: '21%' }}>Customer Details</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Items Summary</th>
                    <th style={{ width: '12%', textAlign: 'right', whiteSpace: 'nowrap' }}>Grand Total</th>
                    <th style={{ width: '10%', textAlign: 'right', whiteSpace: 'nowrap' }}>Paid</th>
                    <th style={{ width: '11%', textAlign: 'right', whiteSpace: 'nowrap' }}>Balance Due</th>
                    <th style={{ width: '7%', textAlign: 'center', whiteSpace: 'nowrap' }}>Status</th>
                    <th style={{ width: '7%', textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <strong style={{ color: '#3f0913', fontSize: '0.9rem' }}>
                          {inv.invoiceNumber}
                        </strong>
                      </td>
                      <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', color: '#333', fontWeight: 600 }}>
                        {formatDateDDMMYYYY(inv.invoiceDate)}
                      </td>
                      <td>
                        <div><strong style={{ color: '#1c1917', fontSize: '0.88rem' }}>{inv.customer.name}</strong></div>
                        <div style={{ fontSize: '0.72rem', color: '#666', whiteSpace: 'nowrap' }}>
                          Ph: {inv.customer.mobile} &bull; {inv.customer.city}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600 }}>{inv.items.length} items</div>
                        <div style={{ fontSize: '0.7rem', color: '#777' }}>
                          {formatGrams(inv.items.reduce((sum, it) => sum + it.netWeight, 0))} total wt
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <strong style={{ fontSize: '0.94rem', color: '#2b040b' }}>
                          {formatCurrency(inv.grandTotal)}
                        </strong>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap', color: '#15803d', fontWeight: 700, fontSize: '0.88rem' }}>
                        {formatCurrency(inv.amountPaid)}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {inv.balanceDue > 0 ? (
                          <strong style={{ color: '#b91c1c', fontSize: '0.92rem' }}>
                            {formatCurrency(inv.balanceDue)}
                          </strong>
                        ) : (
                          <span style={{ color: '#15803d', fontWeight: 700, fontSize: '0.82rem' }}>₹0 (Cleared)</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span className={`badge badge-${inv.status.toLowerCase()}`} style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                          <button
                            className="btn-royal-outline btn-sm"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                            title="View / Print Tax Invoice"
                            onClick={() => onViewInvoice(inv)}
                          >
                            <Printer size={13} /> Bill
                          </button>

                          {inv.balanceDue > 0 && (
                            <button
                              className="btn-royal-gold btn-sm"
                              style={{ fontWeight: 800, padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                              title="Record Customer Payment"
                              onClick={() => onRecordPaymentClick(inv)}
                            >
                              <Clock size={12} /> + Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.25rem',
                  borderTop: '1px solid #e7dfd1',
                  background: '#fdfbf7',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filtered.length)}</strong> of <strong>{filtered.length}</strong> bills (15 items per page)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn-royal-outline btn-sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3f0913', padding: '0 0.5rem' }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      className="btn-royal-outline btn-sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
