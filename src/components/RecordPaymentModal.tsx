import React, { useState } from 'react';
import { X, CheckCircle2, DollarSign, CreditCard, Banknote, QrCode } from 'lucide-react';
import { Invoice, PaymentMethod, PaymentRecord } from '../types';
import { formatCurrency } from '../utils/calculations';

interface RecordPaymentModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onPaymentSuccess: (
    invoiceId: string, 
    amount: number, 
    method: PaymentMethod, 
    ref?: string, 
    notes?: string
  ) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  invoice,
  onClose,
  onPaymentSuccess
}) => {
  if (!invoice) return null;

  const [amount, setAmount] = useState<number>(invoice.balanceDue);
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [ref, setRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('Customer installment / balance payment');
  const [error, setError] = useState<string>('');

  const remainingAfterPayment = Math.max(0, invoice.balanceDue - (amount || 0));

  const handleQuickPercent = (pct: number) => {
    setAmount(Math.round(invoice.balanceDue * (pct / 100)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Please enter a valid payment amount greater than 0.');
      return;
    }
    if (amount > invoice.balanceDue) {
      setError(`Payment cannot exceed the remaining balance of ${formatCurrency(invoice.balanceDue)}.`);
      return;
    }

    onPaymentSuccess(invoice.id, amount, method, ref, notes);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '560px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <DollarSign size={20} color="#dfc794" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Record Customer Payment (जमा पर्ची)</h3>
              <div style={{ fontSize: '0.75rem', color: '#e5d0a6', marginTop: '2px' }}>
                Updates {invoice.invoiceNumber} in-place &bull; No new bill created
              </div>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#dfc794', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        <form 
          onSubmit={handleSubmit} 
          noValidate
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            flex: 1, 
            minHeight: 0, 
            overflow: 'hidden' 
          }}
        >
          <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
            
            {/* Invoice Info Header */}
            <div style={{ 
              background: '#faf7f0', 
              border: '1.5px solid #ded5c5', 
              borderRadius: '10px', 
              padding: '1rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>Invoice No:</span>
                <strong style={{ color: '#3f0913' }}>{invoice.invoiceNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>Customer Name:</span>
                <strong>{invoice.customer.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>Total Bill:</span>
                <span>{formatCurrency(invoice.grandTotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>Previously Paid:</span>
                <span style={{ color: '#15803d', fontWeight: 600 }}>{formatCurrency(invoice.amountPaid)}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                borderTop: '1px solid #d4c8b2', 
                paddingTop: '6px', 
                marginTop: '6px',
                fontSize: '1rem',
                fontWeight: 800,
                color: '#b91c1c'
              }}>
                <span>Current Balance Due:</span>
                <span>{formatCurrency(invoice.balanceDue)}</span>
              </div>
            </div>

            {/* Payment Amount Input */}
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label className="form-label">
                <span>Enter Amount Received (₹)</span>
                <span className="hint">Max: {formatCurrency(invoice.balanceDue)}</span>
              </label>
              
              <div className="input-with-symbol">
                <span className="input-symbol-prefix">₹</span>
                <input 
                  type="number" 
                  className="form-input"
                  style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}
                  value={amount || ''}
                  onChange={(e) => {
                    setError('');
                    setAmount(Number(e.target.value));
                  }}
                  min={1}
                  max={invoice.balanceDue}
                  step="any"
                  placeholder="e.g. 10000"
                  autoFocus
                />
              </div>

              {/* Quick Amount Selector Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn-royal-outline btn-sm"
                  onClick={() => handleQuickPercent(25)}
                >
                  25%
                </button>
                <button 
                  type="button" 
                  className="btn-royal-outline btn-sm"
                  onClick={() => handleQuickPercent(50)}
                >
                  50%
                </button>
                <button 
                  type="button" 
                  className="btn-royal-outline btn-sm"
                  onClick={() => handleQuickPercent(75)}
                >
                  75%
                </button>
                <button 
                  type="button" 
                  className="btn-royal-gold btn-sm"
                  style={{ fontWeight: 800 }}
                  onClick={() => handleQuickPercent(100)}
                >
                  Full Clearance ({formatCurrency(invoice.balanceDue)})
                </button>
              </div>
            </div>

            {/* Slider control as discussed in the demo */}
            <div style={{ marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666', marginBottom: '2px' }}>
                <span>₹0</span>
                <span>Payment Slider</span>
                <span>{formatCurrency(invoice.balanceDue)}</span>
              </div>
              <input 
                type="range" 
                min={0} 
                max={invoice.balanceDue} 
                step={1}
                value={amount || 0}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#c59b48' }}
              />
            </div>

            {/* Payment Method Selector */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Payment Mode</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {(['UPI', 'CASH', 'CARD', 'NET_BANKING'] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      border: method === m ? '2px solid #3f0913' : '1px solid #ccc',
                      background: method === m ? '#fbf4ea' : '#fff',
                      fontWeight: method === m ? 800 : 500,
                      color: method === m ? '#3f0913' : '#444',
                      fontSize: '0.78rem'
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Reference & Notes */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Transaction Reference / UTR (Optional)</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="e.g. UPI/3982104921/GPay"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
              />
            </div>

            {/* After Payment Summary Box */}
            <div style={{ 
              background: remainingAfterPayment === 0 ? '#ecfdf5' : '#fffbeb', 
              border: `1px solid ${remainingAfterPayment === 0 ? '#bbf7d0' : '#fde68a'}`,
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>Remaining Balance After This Payment:</div>
                <div style={{ 
                  fontSize: '1.15rem', 
                  fontWeight: 900, 
                  color: remainingAfterPayment === 0 ? '#15803d' : '#b45309' 
                }}>
                  {formatCurrency(remainingAfterPayment)}
                </div>
              </div>
              <span className={`badge ${remainingAfterPayment === 0 ? 'badge-paid' : 'badge-partial'}`}>
                {remainingAfterPayment === 0 ? 'Will Be Marked PAID' : 'PARTIALLY PAID'}
              </span>
            </div>

            {error && (
              <div style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '0.75rem', fontWeight: 600 }}>
                {error}
              </div>
            )}

          </div>

          <div className="modal-footer" style={{ 
            flexShrink: 0, 
            background: '#faf7f2', 
            borderTop: '2px solid #d4b26f', 
            padding: '0.85rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            boxShadow: '0 -4px 15px rgba(0,0,0,0.06)'
          }}>
            <button 
              type="button" 
              className="btn-royal-outline" 
              onClick={onClose}
              style={{ padding: '0.65rem 1.25rem' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              id="confirm-payment-btn"
              className="btn-royal-gold"
              style={{ 
                fontWeight: 800, 
                fontSize: '0.95rem', 
                padding: '0.75rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(197, 155, 72, 0.4)'
              }}
            >
              <CheckCircle2 size={18} /> Update & Save in Bill ({formatCurrency(amount || 0)})
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
