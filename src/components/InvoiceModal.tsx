import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Share2, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Smartphone
} from 'lucide-react';
import { Invoice, ShopSettings } from '../types';
import { formatCurrency, formatGrams, numberToWordsINR } from '../utils/calculations';

// Helper to format ISO YYYY-MM-DD to Indian DD/MM/YYYY
const formatDateDDMMYYYY = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

interface InvoiceModalProps {
  invoice: Invoice | null;
  settings: ShopSettings;
  isDraft?: boolean;
  onClose: () => void;
  onConfirmSaveDraft?: (invoice: Invoice) => void;
  onRecordPaymentClick?: (invoice: Invoice) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  invoice,
  settings,
  isDraft = false,
  onClose,
  onConfirmSaveDraft,
  onRecordPaymentClick
}) => {
  const [printLayout, setPrintLayout] = useState<'A4' | 'THERMAL'>('A4');
  const [isSavedLocally, setIsSavedLocally] = useState<boolean>(!isDraft);

  if (!invoice) return null;

  const displayStateCode = (settings.stateCode === '08' || !settings.stateCode) ? '10' : settings.stateCode;
  const displayState = (settings.state === 'Rajasthan' || !settings.state) ? 'Bihar' : settings.state;
  const displayCity = (settings.city === 'Jaipur' || !settings.city) ? 'Bara Chakia' : settings.city;
  const displayPincode = (settings.pincode === '302003' || !settings.pincode) ? '845412' : settings.pincode;
  const displayGstin = (settings.gstin?.startsWith('08') || !settings.gstin) ? `10${settings.gstin?.slice(2) || 'ABCDE1234F1Z5'}` : settings.gstin;
  const displayAddress = (settings.address || 'Sahebganj Road, Bara Chakia').replace(/,,+/g, ',');
  const displayPlaceOfSupply = (invoice.customer.state && invoice.customer.state !== 'Rajasthan') 
    ? invoice.customer.state 
    : 'Bihar';

  const handlePrint = () => {
    if (isDraft && !isSavedLocally && onConfirmSaveDraft && invoice) {
      onConfirmSaveDraft(invoice);
      setIsSavedLocally(true);
    }
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `*Mani Alankar Jewellers — Tax Invoice*\n` +
      `Invoice No: ${invoice.invoiceNumber}\n` +
      `Date: ${formatDateDDMMYYYY(invoice.invoiceDate)}\n` +
      `Customer: ${invoice.customer.name}\n` +
      `Grand Total: ${formatCurrency(invoice.grandTotal)}\n` +
      `Amount Paid: ${formatCurrency(invoice.amountPaid)}\n` +
      `Balance Due: ${formatCurrency(invoice.balanceDue)}\n` +
      `Status: ${invoice.status}\n\n` +
      `Thank you for shopping with Mani Alankar Jewellers! For inquiries, call ${settings.phone}.`
    );
    const phone = invoice.customer.mobile.replace(/\D/g, '');
    window.open(`https://wa.me/91${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: printLayout === 'A4' ? '920px' : '440px' }}>
        
        {/* Unsaved Draft Banner */}
        {isDraft && !isSavedLocally && (
          <div className="no-print" style={{
            background: '#fffbeb',
            borderBottom: '1.5px solid #fde68a',
            padding: '7px 14px',
            fontSize: '0.8rem',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>
              ℹ️ <strong>Preview Draft:</strong> Yeh bill abhi database me save nahi hua hai. <strong>Print / Download</strong> karne par yeh save hoga.
            </span>
            <span style={{
              fontWeight: 700,
              background: '#fef3c7',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid #fcd34d'
            }}>
              Unsaved Draft
            </span>
          </div>
        )}

        {/* Modal Controls - Hidden during Print */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={20} color="#dfc794" />
            <h3>Tax Invoice — {invoice.invoiceNumber}</h3>
            <span className={`badge badge-${invoice.status.toLowerCase()}`}>
              {invoice.status}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* Layout Toggle */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '2px' }}>
              <button
                style={{
                  border: 'none',
                  background: printLayout === 'A4' ? '#c59b48' : 'transparent',
                  color: printLayout === 'A4' ? '#1a0408' : '#e7dfd1',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
                onClick={() => setPrintLayout('A4')}
              >
                A4 Standard
              </button>
              <button
                style={{
                  border: 'none',
                  background: printLayout === 'THERMAL' ? '#c59b48' : 'transparent',
                  color: printLayout === 'THERMAL' ? '#1a0408' : '#e7dfd1',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
                onClick={() => setPrintLayout('THERMAL')}
              >
                Thermal (80mm)
              </button>
            </div>

            <button 
              className="btn-royal-gold btn-sm"
              onClick={handlePrint}
              title={isDraft && !isSavedLocally ? "Save & Print Invoice" : "Print Invoice"}
            >
              <Printer size={15} /> {isDraft && !isSavedLocally ? "Save & Print" : "Print"}
            </button>

            <button 
              className="btn-royal-gold btn-sm"
              onClick={handlePrint}
              title="Download / Save PDF"
            >
              <Download size={15} /> Download PDF
            </button>

            <button 
              className="btn-royal-outline btn-sm"
              style={{ color: '#ffffff', borderColor: '#dfc794' }}
              onClick={handleWhatsAppShare}
              title="Send via WhatsApp"
            >
              <Share2 size={15} /> WhatsApp
            </button>

            <button 
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#dfc794', padding: '4px' }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Modal Printable Sheet */}
        <div className="modal-body" style={{ background: '#f5f2eb' }}>
          
          {printLayout === 'A4' ? (
            /* STANDARD A4 GST TAX INVOICE */
            <div className="invoice-scroll-wrapper">
              <div className="tax-invoice-sheet invoice-container" id="printable-invoice">
              
              {/* Header Box */}
              <div className="invoice-header-grid">
                <img 
                  src="/mani_alankar_logo.jpg" 
                  alt="Mani Alankar Logo" 
                  className="invoice-logo-img" 
                />
                <div className="invoice-company-details">
                  <h2>{settings.shopName}</h2>
                  <p style={{ fontWeight: 600, color: '#684507' }}>{settings.tagline}</p>
                  <p>{displayAddress}, {displayCity}, {displayState} - {displayPincode}</p>
                  <p>
                    <strong>Phone:</strong> {settings.phone} | <strong>Email:</strong> {settings.email}
                  </p>
                  <p>
                    <strong>GSTIN:</strong> {displayGstin} | <strong>PAN:</strong> {settings.pan} | <strong>BIS Hallmark Lic:</strong> {settings.bisHallmarkLicense}
                  </p>
                </div>

                <div className="invoice-title-badge">
                  <div style={{ 
                    border: '2px solid #3f0913', 
                    padding: '6px 10px', 
                    background: '#fcfbf8',
                    display: 'inline-block',
                    textAlign: 'right'
                  }}>
                    <h1>TAX INVOICE</h1>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#3f0913' }}>
                      (Rule 46 of CGST Rules, 2017)
                    </div>
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '11px', textAlign: 'right' }}>
                    <div><strong>Original for Recipient</strong></div>
                    <div>State Code: <strong>{displayStateCode} ({displayState})</strong></div>
                  </div>
                </div>
              </div>

              {/* Invoice Meta & Customer Grid */}
              <div className="invoice-parties-grid">
                <div className="party-box">
                  <h4>CUSTOMER DETAILS (BILLED TO)</h4>
                  <table style={{ width: '100%', fontSize: '11px' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '80px', color: '#555' }}>Name:</td>
                        <td><strong>{invoice.customer.name}</strong></td>
                      </tr>
                      <tr>
                        <td style={{ color: '#555' }}>Contact No:</td>
                        <td><strong>{invoice.customer.mobile}</strong></td>
                      </tr>
                      <tr>
                        <td style={{ color: '#555' }}>Address:</td>
                        <td>{invoice.customer.address}, {invoice.customer.city}, {invoice.customer.state === 'Rajasthan' ? 'Bihar' : (invoice.customer.state || displayState)}</td>
                      </tr>
                      {invoice.customer.gstin && (
                        <tr>
                          <td style={{ color: '#555' }}>Customer GSTIN:</td>
                          <td><strong>{invoice.customer.gstin}</strong></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="party-box">
                  <h4>INVOICE PARTICULARS</h4>
                  <table style={{ width: '100%', fontSize: '11px' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '90px', color: '#555' }}>Invoice No:</td>
                        <td><strong style={{ color: '#3f0913', fontSize: '12px' }}>{invoice.invoiceNumber}</strong></td>
                      </tr>
                      <tr>
                        <td style={{ color: '#555' }}>Date of Issue:</td>
                        <td><strong>{formatDateDDMMYYYY(invoice.invoiceDate)}</strong></td>
                      </tr>
                      <tr>
                        <td style={{ color: '#555' }}>Place of Supply:</td>
                        <td><strong>{displayPlaceOfSupply}</strong></td>
                      </tr>
                      <tr>
                        <td style={{ color: '#555' }}>Payment Status:</td>
                        <td>
                          <strong style={{ 
                            color: invoice.status === 'PAID' ? '#15803d' : invoice.status === 'PARTIAL' ? '#b45309' : '#b91c1c',
                            fontWeight: 700,
                            fontSize: '11px',
                            letterSpacing: '0.03em'
                          }}>
                            {invoice.status}
                          </strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Items Table */}
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th style={{ width: '30px' }}>#</th>
                    <th>Item Description & Metal</th>
                    <th style={{ width: '80px' }}>Purity</th>
                    <th style={{ width: '65px' }}>Gross Wt</th>
                    <th style={{ width: '65px' }}>Net Wt</th>
                    <th style={{ width: '75px' }}>Rate / g</th>
                    <th style={{ width: '85px' }}>Metal Value</th>
                    <th style={{ width: '80px' }}>Making Chg</th>
                    <th style={{ width: '85px' }}>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                      <td>
                        <strong>{item.description}</strong>
                        <div style={{ fontSize: '10px', color: '#666' }}>
                          Metal: {item.metal} {item.stoneWeight > 0 ? `| Stone Wt: ${item.stoneWeight}g` : ''}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}><strong>{item.purity}</strong></td>
                      <td style={{ textAlign: 'right' }}>{formatGrams(item.grossWeight)}</td>
                      <td style={{ textAlign: 'right' }}><strong>{formatGrams(item.netWeight)}</strong></td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(item.ratePerGram)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(item.metalValue)}</td>
                      <td style={{ textAlign: 'right' }}>
                        {formatCurrency(item.makingChargeAmount)}
                        <div style={{ fontSize: '9px', color: '#777' }}>
                          {item.makingChargeType === 'PERCENT' ? `(${item.makingChargeValue}%)` : `(@₹${item.makingChargeValue}/g)`}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {formatCurrency(item.totalItemAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Old Gold Deduction & Summary Breakdown Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                
                {/* Left Side: Old Exchange, Payment Ledger & Bank details */}
                <div>
                  {/* Old Gold Exchange Box if present */}
                  {invoice.oldGoldExchange && (
                    <div style={{ border: '1px solid #78716c', padding: '6px 8px', marginBottom: '8px', background: '#faf6ec' }}>
                      <div style={{ fontWeight: 700, fontSize: '10px', color: '#3f0913', textTransform: 'uppercase' }}>
                        Old Ornament / Scrap Exchange (Deduction)
                      </div>
                      <div style={{ fontSize: '11px', marginTop: '2px' }}>
                        <strong>{invoice.oldGoldExchange.description}</strong> ({invoice.oldGoldExchange.purity})
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#444', marginTop: '2px' }}>
                        <span>Wt: {formatGrams(invoice.oldGoldExchange.netWeight)} @ ₹{invoice.oldGoldExchange.ratePerGram}/g</span>
                        <span>Melt Cut: {invoice.oldGoldExchange.meltingDeductionPercent}%</span>
                        <strong style={{ color: '#b91c1c' }}>−{formatCurrency(invoice.exchangeDeduction)}</strong>
                      </div>
                    </div>
                  )}

                  {/* Payment History / Receipts (जमा बही / किश्त रसीद) */}
                  <div style={{ border: '1.5px solid #8c734b', padding: '6px 8px', background: '#fdfbf7', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #d4c8b2', paddingBottom: '3px' }}>
                      <span style={{ fontWeight: 800, fontSize: '10px', color: '#3f0913', textTransform: 'uppercase' }}>
                        Payment History & Ledger (जमा खाता)
                      </span>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: invoice.balanceDue > 0 ? '#b91c1c' : '#15803d' }}>
                        {invoice.balanceDue > 0 ? 'PARTIAL DUES PENDING' : '✓ FULLY CLEARED'}
                      </span>
                    </div>

                    {invoice.payments && invoice.payments.length > 0 ? (
                      <table style={{ width: '100%', fontSize: '10px', marginTop: '4px', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ color: '#666', fontSize: '9px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>
                            <th style={{ padding: '2px 0' }}>Installment #</th>
                            <th>Mode / Ref</th>
                            <th style={{ textAlign: 'right' }}>Amount Paid</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoice.payments.map((p, idx) => (
                            <tr key={p.id} style={{ borderBottom: '1px dotted #ccc' }}>
                              <td style={{ padding: '2px 0' }}>
                                #{idx + 1} &bull; {formatDateDDMMYYYY(p.paidAt)}
                              </td>
                              <td>
                                <strong>{p.paymentMethod}</strong> {p.transactionRef ? `(${p.transactionRef})` : ''}
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 700, color: '#15803d' }}>
                                +{formatCurrency(p.amount)}
                              </td>
                            </tr>
                          ))}
                          <tr style={{ borderTop: '1px solid #8c734b', fontWeight: 800 }}>
                            <td colSpan={2} style={{ paddingTop: '3px' }}>Total Paid So Far:</td>
                            <td style={{ textAlign: 'right', color: '#15803d', paddingTop: '3px' }}>
                              {formatCurrency(invoice.amountPaid)}
                            </td>
                          </tr>
                          {invoice.balanceDue > 0 && (
                            <tr style={{ color: '#b91c1c', fontWeight: 800, fontSize: '10px' }}>
                              <td colSpan={2}>Remaining Balance Due (बकाया):</td>
                              <td style={{ textAlign: 'right' }}>
                                {formatCurrency(invoice.balanceDue)}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ fontSize: '10px', color: '#888', fontStyle: 'italic', marginTop: '2px' }}>
                        No advance payment recorded. Total {formatCurrency(invoice.grandTotal)} pending.
                      </div>
                    )}
                  </div>

                  {/* Bank Details */}
                  <div style={{ marginTop: '8px', fontSize: '10px', color: '#444' }}>
                    <strong>Bank:</strong> {settings.bankName} | <strong>A/C:</strong> {settings.accountNo} | <strong>IFSC:</strong> {settings.ifsc} | <strong>UPI:</strong> {settings.upiId}
                  </div>
                </div>

                {/* Right Side: Tax & Totals Breakdown */}
                <table className="invoice-summary-table">
                  <tbody>
                    <tr>
                      <td style={{ width: '60%' }}>Gross Ornaments Total:</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(invoice.grossAmount)}</td>
                    </tr>
                    {invoice.exchangeDeduction > 0 && (
                      <tr>
                        <td style={{ color: '#b91c1c' }}>Less: Old Exchange Deduction:</td>
                        <td style={{ textAlign: 'right', color: '#b91c1c' }}>−{formatCurrency(invoice.exchangeDeduction)}</td>
                      </tr>
                    )}
                    <tr style={{ background: '#fbf8f0', fontWeight: 700 }}>
                      <td>Taxable Value:</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(invoice.taxableAmount)}</td>
                    </tr>
                    
                    {/* GST Breakdown (CBIC Jewellery 3% or 0% when unticked) */}
                    {invoice.totalGst > 0 ? (
                      !invoice.isInterState ? (
                        <>
                          <tr>
                            <td>CGST @ 1.5%:</td>
                            <td style={{ textAlign: 'right' }}>{formatCurrency(invoice.cgstAmount)}</td>
                          </tr>
                          <tr>
                            <td>SGST @ 1.5%:</td>
                            <td style={{ textAlign: 'right' }}>{formatCurrency(invoice.sgstAmount)}</td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td>IGST @ 3.0%:</td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(invoice.igstAmount)}</td>
                        </tr>
                      )
                    ) : (
                      <tr>
                        <td style={{ color: '#666' }}>GST (0% / Exempt):</td>
                        <td style={{ textAlign: 'right', color: '#666' }}>₹0.00</td>
                      </tr>
                    )}

                    {invoice.discountAmount > 0 && (
                      <tr>
                        <td style={{ color: '#b91c1c', fontWeight: 600 }}>Less: Special Discount (Tax-Free):</td>
                        <td style={{ textAlign: 'right', color: '#b91c1c', fontWeight: 600 }}>−{formatCurrency(invoice.discountAmount)}</td>
                      </tr>
                    )}

                    {invoice.roundOff !== 0 && (
                      <tr>
                        <td>Round Off:</td>
                        <td style={{ textAlign: 'right' }}>{invoice.roundOff > 0 ? `+${invoice.roundOff}` : invoice.roundOff}</td>
                      </tr>
                    )}

                    <tr style={{ background: '#3f0913', color: '#f7e7be', fontWeight: 800, fontSize: '13px' }}>
                      <td>GRAND TOTAL (₹):</td>
                      <td style={{ textAlign: 'right', color: '#ffffff' }}>{formatCurrency(invoice.grandTotal)}</td>
                    </tr>

                    <tr>
                      <td style={{ color: '#15803d', fontWeight: 700 }}>Total Amount Received:</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#15803d' }}>
                        {formatCurrency(invoice.amountPaid)}
                      </td>
                    </tr>

                    <tr style={{ 
                      background: invoice.balanceDue > 0 ? '#fef2f2' : '#ecfdf5',
                      fontWeight: 800, 
                      color: invoice.balanceDue > 0 ? '#b91c1c' : '#15803d' 
                    }}>
                      <td>BALANCE DUE:</td>
                      <td style={{ textAlign: 'right' }}>
                        {formatCurrency(invoice.balanceDue)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Amount in Words */}
              <div style={{ marginTop: '0.4rem', padding: '4px 8px', background: '#f7f4ec', border: '1px solid #d4c7b2', fontSize: '11px' }}>
                <strong>Amount Chargeable (in words):</strong> {numberToWordsINR(invoice.grandTotal)}
              </div>

              {/* Terms and Signatures */}
              <div style={{ marginTop: '0.4rem', fontSize: '9.5px', color: '#555' }}>
                <strong>Terms & Conditions:</strong>
                <ol style={{ paddingLeft: '1.2rem', margin: '2px 0' }}>
                  {settings.invoiceTerms.slice(0, 4).map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ol>
              </div>

              <div className="invoice-footer-signatures">
                <div className="signature-box">
                  <div className="signature-line">
                    Customer's Acknowledgment & Signature
                  </div>
                </div>
                <div className="signature-box">
                  <div style={{ fontWeight: 800, color: '#3f0913', marginBottom: '2px' }}>
                    For MANI ALANKAR JEWELLERS
                  </div>
                  <div className="signature-line">
                    Authorised Signatory
                  </div>
                </div>
              </div>
            </div>
            </div>
          ) : (
            /* COMPACT THERMAL 80MM RECEIPT */
            <div className="invoice-container thermal-receipt-sheet" style={{ 
              background: '#ffffff', 
              padding: '1.2rem', 
              fontFamily: 'monospace', 
              fontSize: '11px',
              border: '1px dashed #999',
              maxWidth: '360px',
              margin: '0 auto',
              lineHeight: '1.3'
            }}>
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #333', paddingBottom: '8px' }}>
                <h3 style={{ fontSize: '14px', margin: 0, fontWeight: 900 }}>MANI ALANKAR JEWELLERS</h3>
                <div>{displayAddress}, {displayCity} - {displayPincode}</div>
                <div>GSTIN: {displayGstin}</div>
                <div>Ph: {settings.phone}</div>
                <div style={{ marginTop: '4px', fontWeight: 700 }}>*** TAX INVOICE ***</div>
              </div>

              <div style={{ margin: '8px 0', borderBottom: '1px dashed #333', paddingBottom: '6px' }}>
                <div>Bill No: <strong>{invoice.invoiceNumber}</strong></div>
                <div>Date: <strong>{formatDateDDMMYYYY(invoice.invoiceDate)}</strong></div>
                <div>Place of Supply: <strong>{displayPlaceOfSupply}</strong></div>
                <div>Cust: <strong>{invoice.customer.name}</strong> ({invoice.customer.mobile})</div>
              </div>

              <div style={{ borderBottom: '1px dashed #333', paddingBottom: '6px' }}>
                {invoice.items.map((item, i) => (
                  <div key={i} style={{ marginBottom: '6px' }}>
                    <div style={{ fontWeight: 700 }}>{i + 1}. {item.description} ({item.purity})</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#444' }}>
                      <span>{formatGrams(item.netWeight)} @ ₹{item.ratePerGram}</span>
                      <span>₹{item.totalItemAmount}</span>
                    </div>
                  </div>
                ))}
              </div>

              {invoice.exchangeDeduction > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c', margin: '4px 0' }}>
                  <span>Old Exchange Deduction:</span>
                  <span>−{formatCurrency(invoice.exchangeDeduction)}</span>
                </div>
              )}

              <div style={{ margin: '6px 0', borderBottom: '1px dashed #333', paddingBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Taxable:</span>
                  <span>{formatCurrency(invoice.taxableAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GST ({invoice.totalGst > 0 ? '3%' : '0%'}):</span>
                  <span>{formatCurrency(invoice.totalGst)}</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c' }}>
                    <span>Special Discount:</span>
                    <span>−{formatCurrency(invoice.discountAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '13px', marginTop: '4px' }}>
                  <span>GRAND TOTAL:</span>
                  <span>{formatCurrency(invoice.grandTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d' }}>
                  <span>Total Paid So Far:</span>
                  <span>{formatCurrency(invoice.amountPaid)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: invoice.balanceDue > 0 ? '#b91c1c' : '#15803d' }}>
                  <span>BALANCE DUE:</span>
                  <span>{formatCurrency(invoice.balanceDue)}</span>
                </div>

                {/* Detailed Installments on Thermal */}
                {invoice.payments && invoice.payments.length > 0 && (
                  <div style={{ margin: '5px 0 0 0', borderTop: '1px dotted #333', paddingTop: '4px', fontSize: '10px' }}>
                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>Payment Installments (किश्त विवरण):</div>
                    {invoice.payments.map((p, idx) => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d' }}>
                        <span>#{idx + 1} ({formatDateDDMMYYYY(p.paidAt)}) {p.paymentMethod}:</span>
                        <span>+{formatCurrency(p.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '10px' }}>
                <div>100% Hallmark Certified Gold & Silver</div>
                <div>Thank you! Visit Again.</div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls - Hidden in print */}
        <div className="modal-footer no-print">
          {invoice.balanceDue > 0 && onRecordPaymentClick && (
            <button
              className="btn-royal-primary"
              style={{ marginRight: 'auto' }}
              onClick={() => {
                onClose();
                onRecordPaymentClick(invoice);
              }}
            >
              <Clock size={16} /> Record Next Payment (+ ₹)
            </button>
          )}

          <button className="btn-royal-outline" onClick={onClose}>
            Close
          </button>
          
          <button className="btn-royal-gold" onClick={handlePrint}>
            <Printer size={16} /> {isDraft && !isSavedLocally ? 'Save & Print Official Bill' : 'Print Official Bill'}
          </button>
        </div>

      </div>
    </div>
  );
};
