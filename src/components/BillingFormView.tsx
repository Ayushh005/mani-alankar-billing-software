import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  RotateCcw, 
  FileCheck, 
  Sparkles, 
  Percent, 
  CreditCard,
  User,
  ShieldCheck,
  Scale,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { 
  Invoice, 
  InvoiceItem, 
  MetalRatesSnapshot, 
  MetalType, 
  OldGoldExchange, 
  PaymentMethod, 
  ShopSettings 
} from '../types';
import { 
  calculateItemTotals, 
  calculateOldGoldExchange, 
  formatCurrency, 
  formatGrams, 
  numberToWordsINR, 
  round 
} from '../utils/calculations';
import { getRateForPurity } from '../utils/rates';

interface BillingFormViewProps {
  rates: MetalRatesSnapshot;
  settings: ShopSettings;
  existingInvoices: Invoice[];
  onSaveInvoice: (invoice: Invoice, openPreview?: boolean) => void;
  onPreviewDraftInvoice?: (invoice: Invoice) => void;
}

export const BillingFormView: React.FC<BillingFormViewProps> = ({
  rates,
  settings,
  existingInvoices,
  onSaveInvoice,
  onPreviewDraftInvoice
}) => {
  // Confirmation Modal state for Double Check before saving
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [pendingInvoice, setPendingInvoice] = useState<Invoice | null>(null);

  // Focus and shortcut references for high-speed billing
  const mobileInputRef = useRef<HTMLInputElement | null>(null);
  const descriptionRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const pendingFocusIdRef = useRef<string | null>(null);

  // Customer Details
  const [customerName, setCustomerName] = useState<string>('');
  const [customerMobile, setCustomerMobile] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('Local Market');
  const [customerCity, setCustomerCity] = useState<string>(settings.city || 'Bara Chakia');
  const [customerState, setCustomerState] = useState<string>((settings.state === 'Rajasthan' || !settings.state) ? 'Bihar' : settings.state);
  const [customerGstin, setCustomerGstin] = useState<string>('');

  useEffect(() => {
    if (settings.city && (!customerCity || customerCity === 'Jaipur')) {
      setCustomerCity(settings.city);
    }
    if (settings.state && (!customerState || customerState === 'Rajasthan')) {
      setCustomerState((settings.state === 'Rajasthan' || !settings.state) ? 'Bihar' : settings.state);
    }
  }, [settings.city, settings.state]);

  // Items in bill
  const [items, setItems] = useState<InvoiceItem[]>(() => {
    const initialRate = getRateForPurity(rates, 'GOLD', '22K (916)');
    const initialItem: Omit<InvoiceItem, 'metalValue' | 'makingChargeAmount' | 'totalItemAmount' | 'wastageAmount'> = {
      id: `itm_${Date.now()}_1`,
      metal: 'GOLD',
      purity: '22K (916)',
      description: '',
      hsnCode: '7113',
      grossWeight: 0,
      netWeight: 0,
      stoneWeight: 0,
      ratePerGram: initialRate,
      makingChargeType: settings.defaultMakingChargeType,
      makingChargeValue: settings.defaultMakingChargeValue,
      stoneCharges: 0,
      wastagePercent: 0
    };
    return [calculateItemTotals(initialItem)];
  });

  // Old Gold Exchange Section
  const [hasExchange, setHasExchange] = useState<boolean>(false);
  const [exchange, setExchange] = useState<OldGoldExchange>({
    description: 'Old Gold Scrap Exchange',
    metal: 'GOLD',
    purity: '20K',
    grossWeight: 0,
    netWeight: 0,
    ratePerGram: 6400,
    meltingDeductionPercent: 2,
    totalExchangeAmount: 0
  });

  // Overall Discount & Payment
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [applyGst, setApplyGst] = useState<boolean>(true);
  const [paymentMode, setPaymentMode] = useState<PaymentMethod>('UPI');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [isInterState, setIsInterState] = useState<boolean>(false);
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [billNotes, setBillNotes] = useState<string>('');

  // Auto-focus description field when a new item is added
  useEffect(() => {
    if (pendingFocusIdRef.current) {
      const targetId = pendingFocusIdRef.current;
      pendingFocusIdRef.current = null;
      requestAnimationFrame(() => {
        descriptionRefs.current[targetId]?.focus();
      });
    }
  }, [items]);

  // F2: Reset Bill & Focus Mobile input for new customer
  const handleResetBill = () => {
    setCustomerName('');
    setCustomerMobile('');
    setCustomerAddress('Local Market');
    setCustomerCity(settings.city || 'Bara Chakia');
    setCustomerState((settings.state === 'Rajasthan' || !settings.state) ? 'Bihar' : settings.state);
    setCustomerGstin('');

    const initialRate = getRateForPurity(rates, 'GOLD', '22K (916)');
    const initialItem: Omit<InvoiceItem, 'metalValue' | 'makingChargeAmount' | 'totalItemAmount' | 'wastageAmount'> = {
      id: `itm_${Date.now()}_1`,
      metal: 'GOLD',
      purity: '22K (916)',
      description: '',
      hsnCode: '7113',
      grossWeight: 0,
      netWeight: 0,
      stoneWeight: 0,
      ratePerGram: initialRate,
      makingChargeType: settings.defaultMakingChargeType,
      makingChargeValue: settings.defaultMakingChargeValue,
      stoneCharges: 0,
      wastagePercent: 0
    };
    setItems([calculateItemTotals(initialItem)]);

    setHasExchange(false);
    setExchange({
      description: 'Old Gold Scrap Exchange',
      metal: 'GOLD',
      purity: '20K',
      grossWeight: 0,
      netWeight: 0,
      ratePerGram: 6400,
      meltingDeductionPercent: 2,
      totalExchangeAmount: 0
    });

    setDiscountAmount(0);
    setAmountPaid(0);
    setTransactionRef('');
    setBillNotes('');
    setApplyGst(true);
    setIsInterState(false);
    setShowConfirmModal(false);
    setPendingInvoice(null);

    requestAnimationFrame(() => {
      mobileInputRef.current?.focus();
    });
  };

  // Autocomplete customer from mobile
  const handleMobileChange = (mobile: string) => {
    setCustomerMobile(mobile);
    if (mobile.length >= 10) {
      const found = existingInvoices.find(inv => inv.customer.mobile.includes(mobile));
      if (found) {
        setCustomerName(found.customer.name);
        setCustomerAddress(found.customer.address);
        setCustomerCity(found.customer.city);
        setCustomerState((found.customer.state === 'Rajasthan' || !found.customer.state) ? 'Bihar' : found.customer.state);
        if (found.customer.gstin) setCustomerGstin(found.customer.gstin);
      }
    }
  };

  // Add Item to bill (Alt+A or Enter on last item field)
  const handleAddItem = (metal: MetalType = 'GOLD') => {
    const purity = metal === 'GOLD' 
      ? '22K (916)' 
      : metal === 'SILVER' 
        ? 'Silver 925 (Sterling)' 
        : metal === 'ARTIFICIAL'
          ? '1 Gram Gold Plated'
          : '18K (750)';
    const rate = getRateForPurity(rates, metal, purity);
    const hsn = metal === 'DIAMOND' ? '7102' : metal === 'ARTIFICIAL' ? '7117' : '7113';
    const newId = `itm_${Date.now()}_${items.length + 1}`;
    pendingFocusIdRef.current = newId;

    const newItemRaw: Omit<InvoiceItem, 'metalValue' | 'makingChargeAmount' | 'totalItemAmount' | 'wastageAmount'> = {
      id: newId,
      metal,
      purity,
      description: '',
      hsnCode: hsn,
      grossWeight: 0,
      netWeight: 0,
      stoneWeight: 0,
      ratePerGram: rate,
      makingChargeType: metal === 'GOLD' ? settings.defaultMakingChargeType : metal === 'ARTIFICIAL' ? 'FIXED' : 'PER_GRAM',
      makingChargeValue: metal === 'GOLD' ? settings.defaultMakingChargeValue : metal === 'ARTIFICIAL' ? 0 : 15,
      stoneCharges: 0,
      wastagePercent: 0
    };
    setItems(prevItems => [...prevItems, calculateItemTotals(newItemRaw)]);
  };

  // Update item
  const handleUpdateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setItems(items.map(it => {
      if (it.id !== id) return it;
      const merged = { ...it, ...updates };

      // Automatic HSN and default purity/rates on metal change
      if (updates.metal) {
        if (updates.metal === 'DIAMOND') merged.hsnCode = '7102';
        else if (updates.metal === 'SILVER') merged.hsnCode = '7113';
        else if (updates.metal === 'ARTIFICIAL') merged.hsnCode = '7117';
        else merged.hsnCode = '7113';

        if (!updates.purity) {
          merged.purity = updates.metal === 'GOLD' 
            ? '22K (916)' 
            : updates.metal === 'SILVER' 
              ? 'Silver 925 (Sterling)' 
              : updates.metal === 'ARTIFICIAL'
                ? '1 Gram Gold Plated'
                : '18K (750)';
        }
      }

      // If metal or purity changed, recalculate default rate if user hasn't overridden
      if (updates.metal || updates.purity) {
        const metal = updates.metal || it.metal;
        const purity = updates.purity || it.purity;
        if (!updates.ratePerGram) {
          merged.ratePerGram = getRateForPurity(rates, metal, purity);
        }
      }

      // If user did NOT explicitly override totalItemAmount in this update,
      // recompute totalItemAmount automatically based on current weights/rate/making charges
      if (updates.totalItemAmount === undefined) {
        delete (merged as any).totalItemAmount;
      }

      return calculateItemTotals(merged);
    }));
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      alert('A bill must have at least one jewellery item.');
      return;
    }
    setItems(items.filter(it => it.id !== id));
  };

  // Update exchange
  const handleUpdateExchange = (updates: Partial<OldGoldExchange>) => {
    const merged = { ...exchange, ...updates };
    setExchange(calculateOldGoldExchange(merged));
  };

  // Compute Bill Summary
  const grossAmount = round(items.reduce((sum, it) => sum + it.totalItemAmount, 0));
  const metalValueTotal = round(items.reduce((sum, it) => sum + it.metalValue, 0));
  const makingChargesTotal = round(items.reduce((sum, it) => sum + it.makingChargeAmount, 0));
  const stoneChargesTotal = round(items.reduce((sum, it) => sum + (it.stoneCharges || 0), 0));
  
  const exchangeDeduction = hasExchange ? exchange.totalExchangeAmount : 0;
  
  // Taxable Goods Value (Special discount does NOT impact tax base)
  const taxableAmount = Math.max(0, round(grossAmount - exchangeDeduction));

  // GST 3% calculation or 0% when GST toggle is unticked
  const gstPercent = applyGst ? 3 : 0;
  let cgstRate = 0;
  let sgstRate = 0;
  let igstRate = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (applyGst) {
    if (isInterState) {
      igstRate = 3.0;
      cgstRate = 0;
      sgstRate = 0;
      igstAmount = round((taxableAmount * 3) / 100);
    } else {
      cgstRate = 1.5;
      sgstRate = 1.5;
      igstRate = 0;
      cgstAmount = round((taxableAmount * 1.5) / 100);
      sgstAmount = round((taxableAmount * 1.5) / 100);
    }
  }
  const totalGst = round(cgstAmount + sgstAmount + igstAmount);

  // Grand total: Taxable + GST - Special Discount (Discount deducted post-tax, zero tax impact)
  const rawGrandTotal = Math.max(0, round(taxableAmount + totalGst - (discountAmount || 0)));
  const roundedGrandTotal = Math.round(rawGrandTotal);
  const roundOff = round(roundedGrandTotal - rawGrandTotal);
  const grandTotal = roundedGrandTotal;

  const validAmountPaid = Math.min(amountPaid || 0, grandTotal);
  const balanceDue = Math.max(0, round(grandTotal - validAmountPaid));

  // Determine initial payment status
  let status: Invoice['status'] = 'UNPAID';
  if (balanceDue === 0 && grandTotal > 0) {
    status = 'PAID';
  } else if (validAmountPaid > 0) {
    status = 'PARTIAL';
  }

  // Pre-fill amount paid to full when creating bill for the first time if user desires
  const handleQuickPaidPreset = (preset: 'FULL' | 'HALF' | 'ZERO') => {
    if (preset === 'FULL') setAmountPaid(grandTotal);
    if (preset === 'HALF') setAmountPaid(Math.round(grandTotal / 2));
    if (preset === 'ZERO') setAmountPaid(0);
  };

  const buildInvoiceObject = (): Invoice | null => {
    if (!customerName.trim()) {
      alert('Please enter Customer Name.');
      return null;
    }
    if (!customerMobile.trim() || customerMobile.length < 10) {
      alert('Please enter a valid 10-digit Customer Mobile Number.');
      return null;
    }

    const seqStr = String(settings.nextInvoiceSeq || 1).padStart(4, '0');
    const invoiceNumber = `${settings.invoicePrefix}${seqStr}`;

    const sanitizedItems = items.map(it => ({
      ...it,
      description: it.description.trim() || (
        it.metal === 'GOLD' ? 'Gold Ornament' : 
        it.metal === 'SILVER' ? 'Silver Ornament' : 
        it.metal === 'ARTIFICIAL' ? 'Artificial Jewellery' : 
        'Diamond Jewellery'
      )
    }));

    return {
      id: `inv_${Date.now()}`,
      invoiceNumber,
      invoiceDate: new Date().toISOString().slice(0, 10),
      customer: {
        name: customerName.trim(),
        mobile: customerMobile.trim(),
        address: customerAddress.trim(),
        city: customerCity.trim() || settings.city || 'Bara Chakia',
        state: (customerState.trim() === 'Rajasthan' || !customerState.trim()) ? (settings.state || 'Bihar') : customerState.trim(),
        gstin: customerGstin.trim() || undefined
      },
      items: sanitizedItems,
      metalValueTotal,
      makingChargesTotal,
      stoneChargesTotal,
      grossAmount,
      oldGoldExchange: hasExchange ? exchange : undefined,
      exchangeDeduction,
      discountAmount,
      taxableAmount,
      isInterState,
      gstPercent,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      igstRate,
      igstAmount,
      totalGst,
      roundOff,
      grandTotal,
      amountPaid: validAmountPaid,
      balanceDue,
      status,
      payments: validAmountPaid > 0 ? [
        {
          id: `pay_${Date.now()}`,
          invoiceId: `inv_${Date.now()}`,
          amount: validAmountPaid,
          paymentMethod: paymentMode,
          transactionRef: transactionRef.trim() || undefined,
          paidAt: new Date().toISOString(),
          notes: 'Initial billing payment'
        }
      ] : [],
      ratesSnapshot: { ...rates },
      terms: settings.invoiceTerms,
      notes: billNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  // Double Check Confirmation on "Save Bill to Database"
  const handleRequestSaveToDatabase = () => {
    const inv = buildInvoiceObject();
    if (!inv) return;
    setPendingInvoice(inv);
    setShowConfirmModal(true);
  };

  // "Generate & Print Invoice" -> Opens Preview Draft first without saving to DB yet!
  const handleRequestPreviewAndPrint = () => {
    const inv = buildInvoiceObject();
    if (!inv) return;
    if (onPreviewDraftInvoice) {
      onPreviewDraftInvoice(inv);
    } else {
      onSaveInvoice(inv, true);
    }
  };

  // Global Counter Shortcuts (Counter Speed Boost):
  // F2: Reset & focus on new bill.
  // F4: Open Print / Preview draft modal.
  // Alt + A: Add another Gold item row.
  const handleRequestPreviewAndPrintRef = useRef(handleRequestPreviewAndPrint);
  const handleResetBillRef = useRef(handleResetBill);
  const handleAddItemRef = useRef(handleAddItem);

  useEffect(() => {
    handleRequestPreviewAndPrintRef.current = handleRequestPreviewAndPrint;
    handleResetBillRef.current = handleResetBill;
    handleAddItemRef.current = handleAddItem;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If confirmation modal is open, avoid triggering background shortcuts
      if (showConfirmModal) return;

      // F2: Reset & focus on new bill
      if (e.key === 'F2') {
        e.preventDefault();
        handleResetBillRef.current();
        return;
      }

      // F4: Open Print / Preview draft modal
      if (e.key === 'F4') {
        e.preventDefault();
        handleRequestPreviewAndPrintRef.current();
        return;
      }

      // Alt + A: Add another Gold item row
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        handleAddItemRef.current('GOLD');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showConfirmModal]);

  return (
    <div className="billing-layout-grid">
      
      {/* Left Column: Form Details */}
      <div>
        
        {/* Customer Information Card */}
        <div className="royal-card">
          <div className="royal-card-header">
            <h3 className="royal-card-title">
              <User size={18} color="#3f0913" />
              1. Customer Particulars (Billed To)
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#684507', fontWeight: 600 }}>
                Auto-fills on 10-digit mobile
              </span>
              <button
                type="button"
                onClick={handleResetBill}
                title="Reset Bill & Focus Mobile (F2)"
                className="btn-royal-outline"
                style={{ fontSize: '0.75rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={12} />
                <span>Reset (F2)</span>
              </button>
            </div>
          </div>

          <div className="royal-card-body">
            <div className="form-grid-4">
              <div className="form-group">
                <label className="form-label">
                  <span>Customer Mobile No *</span>
                </label>
                <input 
                  ref={mobileInputRef}
                  type="tel"
                  className="form-input"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={customerMobile}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Customer Name *</span>
                </label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Full Name (e.g. Ramesh Sharma)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>City / Town</span>
                </label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="City"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>State (Place of Supply)</span>
                </label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Bihar"
                  value={customerState}
                  onChange={(e) => setCustomerState(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-3" style={{ marginTop: '1rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Address / Landmark</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Street / Colony / Landmark"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Customer GSTIN (Optional)</span>
                </label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="22AAAAA0000A1Z5"
                  value={customerGstin}
                  onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Jewellery Items Card */}
        <div className="royal-card">
          <div className="royal-card-header">
            <h3 className="royal-card-title">
              <Sparkles size={18} color="#c59b48" />
              2. Jewellery Items ({items.length})
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#886226', fontWeight: 600 }}>
              Hallmark 916 / 750 / Fine Silver
            </span>
          </div>

          <div className="royal-card-body" style={{ padding: '1rem' }}>
            {items.map((item, idx) => (
              <div 
                key={item.id}
                style={{
                  background: '#fdfcf9',
                  border: '1.5px solid #ded5c5',
                  borderRadius: '10px',
                  padding: '1.1rem',
                  marginBottom: '1.25rem',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ 
                      background: '#3f0913', 
                      color: '#f7e7be', 
                      borderRadius: '50%', 
                      width: '24px', 
                      height: '24px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.78rem',
                      fontWeight: 800
                    }}>
                      {idx + 1}
                    </span>
                    <strong style={{ color: '#2b040b', fontSize: '0.95rem' }}>{item.description || 'eg. Jhumka'}</strong>
                    <span className="badge" style={{ background: '#f5ecdb', color: '#886226', border: '1px solid #d4b26f' }}>
                      {item.metal} &bull; {item.purity}
                    </span>
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      style={{ background: 'transparent', border: 'none', color: '#b91c1c', padding: '4px' }}
                      title="Remove Item"
                    >
                      <Trash2 size={17} />
                    </button>
                  )}
                </div>

                <div className="form-grid-4">
                  {/* Metal Type */}
                  <div className="form-group">
                    <label className="form-label">Metal</label>
                    <select
                      className="form-select"
                      value={item.metal}
                      onChange={(e) => handleUpdateItem(item.id, { metal: e.target.value as MetalType })}
                    >
                      <option value="GOLD">Gold</option>
                      <option value="SILVER">Silver</option>
                      <option value="ARTIFICIAL">Artificial Jewellery</option>
                      <option value="DIAMOND">Diamond / Studded</option>
                    </select>
                  </div>

                  {/* Purity */}
                  <div className="form-group">
                    <label className="form-label">Purity</label>
                    <select
                      className="form-select"
                      value={item.purity}
                      onChange={(e) => handleUpdateItem(item.id, { purity: e.target.value })}
                    >
                      {item.metal === 'GOLD' ? (
                        <>
                          <option value="22K (916)">22K (916 Hallmark)</option>
                          <option value="24K">24K (Pure Gold)</option>
                          <option value="18K (750)">18K (750 Hallmark)</option>
                          <option value="14K (585)">14K (585 Hallmark)</option>
                        </>
                      ) : item.metal === 'SILVER' ? (
                        <>
                          <option value="Silver 925 (Sterling)">Silver 925 (Sterling)</option>
                          <option value="Silver 999">Silver 999 (Fine)</option>
                          <option value="Silver 800">Silver 800 (Ornaments)</option>
                        </>
                      ) : item.metal === 'ARTIFICIAL' ? (
                        <>
                          <option value="1 Gram Gold Plated">1 Gram Gold Plated</option>
                          <option value="Micro Gold Plated">Micro Gold Plated / Formed</option>
                          <option value="Brass / Copper Base">Brass / Copper Base</option>
                          <option value="CZ / American Diamond">CZ / American Diamond</option>
                          <option value="Oxidised / Antique">Oxidised / Antique</option>
                          <option value="Kundan / Meenakari">Kundan / Meenakari</option>
                          <option value="Imitation / Fashion">Imitation / Fashion</option>
                        </>
                      ) : (
                        <>
                          <option value="18K (750)">18K (750 Base)</option>
                          <option value="14K (585)">14K (585 Base)</option>
                          <option value="Certified Solitaire">Certified Solitaire</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">
                      <span>Item Description</span>
                    </label>
                    <input
                      ref={(el) => { descriptionRefs.current[item.id] = el; }}
                      type="text"
                      className="form-input"
                      placeholder="eg. Jhumka"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                    />
                  </div>
                </div>

                {/* Weights & Rates Row */}
                <div className="form-grid-4" style={{ marginTop: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">
                      <span>Gross Weight (g)</span>
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      className="form-input"
                      placeholder="0.000"
                      value={item.grossWeight || ''}
                      onChange={(e) => {
                        const gross = e.target.value === '' ? 0 : Number(e.target.value);
                        const stone = item.stoneWeight || 0;
                        handleUpdateItem(item.id, { 
                          grossWeight: gross,
                          netWeight: Math.max(0, gross - stone)
                        });
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Stone Wt (g)</span>
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      className="form-input"
                      placeholder="0.000"
                      value={item.stoneWeight || ''}
                      onChange={(e) => {
                        const stone = e.target.value === '' ? 0 : Number(e.target.value);
                        const gross = item.grossWeight || 0;
                        handleUpdateItem(item.id, { 
                          stoneWeight: stone,
                          netWeight: Math.max(0, gross - stone)
                        });
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Net Weight (g)</span>
                      <span className="hint">Customizable</span>
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      className="form-input"
                      style={{ fontWeight: 800, color: '#3f0913', background: '#fffdf8' }}
                      placeholder="0.000"
                      value={item.netWeight || ''}
                      onChange={(e) => {
                        const net = e.target.value === '' ? 0 : Number(e.target.value);
                        handleUpdateItem(item.id, { netWeight: net });
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Rate / g (₹)</span>
                      <span className="hint">Customizable</span>
                    </label>
                    <div className="input-with-symbol">
                      <span className="input-symbol-prefix">₹</span>
                      <input
                        type="number"
                        className="form-input"
                        style={{ fontWeight: 700 }}
                        value={item.ratePerGram || ''}
                        onChange={(e) => handleUpdateItem(item.id, { ratePerGram: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                {/* Making Charges Row */}
                <div className="form-grid-4" style={{ marginTop: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">Making Charge Type</label>
                    <select
                      className="form-select"
                      value={item.makingChargeType}
                      onChange={(e) => handleUpdateItem(item.id, { makingChargeType: e.target.value as any })}
                    >
                      <option value="PERCENT">% of Metal Value</option>
                      <option value="PER_GRAM">₹ Per Gram</option>
                      <option value="FIXED">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Making Charge Value</span>
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      value={item.makingChargeValue || ''}
                      onChange={(e) => handleUpdateItem(item.id, { makingChargeValue: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Other / Stone Chg (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={item.stoneCharges || ''}
                      onChange={(e) => handleUpdateItem(item.id, { stoneCharges: Number(e.target.value) })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddItem('GOLD');
                        }
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Item Total Amount</span>
                      <span className="hint">Auto (Editable)</span>
                    </label>
                    <div className="input-with-symbol">
                      <span className="input-symbol-prefix">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        style={{ 
                          fontWeight: 800, 
                          color: '#2b040b', 
                          background: '#fffdf9',
                          borderColor: '#d4b26f',
                          textAlign: 'right' 
                        }}
                        placeholder="0.00"
                        value={item.totalItemAmount || ''}
                        onChange={(e) => {
                          const customTotal = e.target.value === '' ? 0 : Number(e.target.value);
                          handleUpdateItem(item.id, { totalItemAmount: customTotal });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddItem('GOLD');
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

              </div>
            ))}

            {/* Handy Add Item Buttons at the Bottom of Cards */}
            <div className="add-items-bottom-bar">
              <button 
                type="button" 
                className="btn-royal-gold add-item-btn"
                onClick={() => handleAddItem('GOLD')}
                title="Add Gold Item (Alt+A)"
              >
                <Plus size={16} />
                <span>Add Gold Item / Ornament (Alt+A)</span>
              </button>
              <button 
                type="button" 
                className="btn-royal-outline add-item-btn"
                onClick={() => handleAddItem('SILVER')}
                title="Add Silver Item"
              >
                <Plus size={16} />
                <span>Add Silver Item</span>
              </button>
              <button 
                type="button" 
                className="btn-royal-outline add-item-btn"
                onClick={() => handleAddItem('ARTIFICIAL')}
                title="Add Artificial Jewellery"
              >
                <Plus size={16} />
                <span>Add Artificial Jewellery</span>
              </button>
            </div>

          </div>
        </div>

        {/* Old Gold / Silver Exchange (Deduction) */}
        <div className="royal-card">
          <div className="royal-card-header">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', margin: 0 }}>
              <input 
                type="checkbox" 
                checked={hasExchange} 
                onChange={(e) => setHasExchange(e.target.checked)} 
                style={{ width: '17px', height: '17px', accentColor: '#3f0913' }}
              />
              <h3 className="royal-card-title" style={{ fontSize: '1rem' }}>
                <Scale size={18} color="#b91c1c" />
                3. Old Gold / Silver Exchange (Scrap Deduction from Bill)
              </h3>
            </label>
            {hasExchange && (
              <span className="badge" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                Deducting −{formatCurrency(exchange.totalExchangeAmount)}
              </span>
            )}
          </div>

          {hasExchange && (
            <div className="royal-card-body">
              <div className="form-grid-4">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Exchange Item Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={exchange.description}
                    onChange={(e) => handleUpdateExchange({ description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Old Metal & Purity</label>
                  <select
                    className="form-select"
                    value={exchange.purity}
                    onChange={(e) => handleUpdateExchange({ purity: e.target.value })}
                  >
                    <option value="22K">Gold 22K (Standard)</option>
                    <option value="20K">Gold 20K (Melting)</option>
                    <option value="18K">Gold 18K</option>
                    <option value="Silver 80%">Silver (Old)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Net Wt (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    className="form-input"
                    value={exchange.grossWeight || ''}
                    onChange={(e) => handleUpdateExchange({ grossWeight: Number(e.target.value), netWeight: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-grid-3" style={{ marginTop: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Purchase Rate / g (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={exchange.ratePerGram || ''}
                    onChange={(e) => handleUpdateExchange({ ratePerGram: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Melting Loss Cut (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={exchange.meltingDeductionPercent || ''}
                    onChange={(e) => handleUpdateExchange({ meltingDeductionPercent: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Deduction Amount (₹)</label>
                  <div style={{
                    padding: '0.65rem 0.85rem',
                    background: '#fef2f2',
                    borderRadius: '8px',
                    border: '1px solid #fecaca',
                    fontWeight: 900,
                    color: '#b91c1c',
                    fontSize: '1rem',
                    textAlign: 'right'
                  }}>
                    −{formatCurrency(exchange.totalExchangeAmount)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Discount, Tax Mode & Optional GST Checkbox */}
        <div className="royal-card">
          <div className="royal-card-header">
            <h3 className="royal-card-title">
              <DollarSign size={18} color="#15803d" />
              4. Discount, GST & Tax Mode
            </h3>
          </div>
          <div className="royal-card-body">
            {/* Optional GST Checkbox Toggle */}
            <div style={{
              background: applyGst ? '#fbf8f0' : '#f5f5f5',
              border: `1.5px solid ${applyGst ? '#d4b26f' : '#d1d5db'}`,
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
            onClick={() => setApplyGst(!applyGst)}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', margin: 0 }}>
                <input
                  type="checkbox"
                  id="billing-apply-gst-toggle"
                  checked={applyGst}
                  onChange={(e) => setApplyGst(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: '19px', height: '19px', accentColor: '#3f0913', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#2b040b' }}>
                    Apply GST on this Bill {applyGst ? '(3% Tax Enabled)' : '(0% Tax - Unticked)'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '2px' }}>
                    {applyGst 
                      ? '✓ 3% Jewellery GST (CGST 1.5% + SGST 1.5% or IGST 3%) is active.' 
                      : '✕ Bill will be generated without GST (₹0.00 Tax).'}
                  </div>
                </div>
              </label>

              <span className={`badge ${applyGst ? 'badge-gold' : 'badge-neutral'}`} style={{ fontSize: '0.75rem' }}>
                {applyGst ? 'GST Active (3%)' : 'GST Exempt / Off'}
              </span>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">
                  <span>Special Discount (₹)</span>
                  <span className="hint">Tax-free</span>
                </label>
                <div className="input-with-symbol">
                  <span className="input-symbol-prefix">₹</span>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={discountAmount || ''}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">GST Tax Treatment</label>
                <select
                  className="form-select"
                  disabled={!applyGst}
                  value={isInterState ? 'INTER' : 'INTRA'}
                  onChange={(e) => setIsInterState(e.target.value === 'INTER')}
                  style={{ opacity: applyGst ? 1 : 0.6 }}
                >
                  <option value="INTRA">Intra-State (CGST 1.5% + SGST 1.5% = 3%)</option>
                  <option value="INTER">Inter-State (IGST 3.0%)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Invoice Notes / Narration</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Optional bill notes"
                  value={billNotes}
                  onChange={(e) => setBillNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Floating Live Summary & Payment Settlement */}
      <div>
        <div className="live-summary-card">
          
          <div className="summary-title">
            <span>Bill Summary</span>
            <span style={{ fontSize: '0.78rem', color: applyGst ? '#886226' : '#6b7280', fontWeight: 600 }}>
              {applyGst ? 'GST 3% Applied' : 'GST 0% (Unticked)'}
            </span>
          </div>

          <div className="summary-row">
            <span>Metal Value ({items.length} items):</span>
            <span className="font-mono">{formatCurrency(metalValueTotal)}</span>
          </div>

          <div className="summary-row">
            <span>Making Charges:</span>
            <span className="font-mono">{formatCurrency(makingChargesTotal)}</span>
          </div>

          {stoneChargesTotal > 0 && (
            <div className="summary-row">
              <span>Stones / Other Charges:</span>
              <span className="font-mono">{formatCurrency(stoneChargesTotal)}</span>
            </div>
          )}

          <div className="summary-row highlight">
            <span>Gross Jewellery Value:</span>
            <strong className="font-mono">{formatCurrency(grossAmount)}</strong>
          </div>

          {exchangeDeduction > 0 && (
            <div className="summary-row" style={{ color: '#b91c1c' }}>
              <span>Less: Old Gold Scrap:</span>
              <strong className="font-mono">−{formatCurrency(exchangeDeduction)}</strong>
            </div>
          )}

          <div className="summary-row highlight">
            <span>Taxable Goods Value:</span>
            <strong className="font-mono">{formatCurrency(taxableAmount)}</strong>
          </div>

          <div className="summary-row">
            <span>
              {!applyGst 
                ? 'GST (0% Unticked):' 
                : (!isInterState ? 'CGST (1.5%) + SGST (1.5%):' : 'IGST (3.0%):')}
            </span>
            <span className="font-mono">{formatCurrency(totalGst)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="summary-row" style={{ color: '#b91c1c' }}>
              <span>Less: Special Discount (Tax-Free):</span>
              <strong className="font-mono">−{formatCurrency(discountAmount)}</strong>
            </div>
          )}

          {roundOff !== 0 && (
            <div className="summary-row" style={{ fontSize: '0.8rem' }}>
              <span>Round off:</span>
              <span className="font-mono">{roundOff > 0 ? `+${roundOff}` : roundOff}</span>
            </div>
          )}

          {/* Grand Total Golden Banner */}
          <div className="grand-total-banner">
            <div className="grand-total-label">
              Grand Total ({applyGst ? 'Inclusive of 3% GST' : 'Zero Tax / 0% GST'})
            </div>
            <div className="grand-total-amount">{formatCurrency(grandTotal)}</div>
            <div className="grand-total-words">{numberToWordsINR(grandTotal)}</div>
          </div>

          {/* Payment Section */}
          <div style={{ marginTop: '1.25rem', borderTop: '1.5px solid #dfc794', paddingTop: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#2b040b', marginBottom: '0.5rem' }}>
              Payment Received Now
            </div>

            {/* Quick buttons */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <button 
                type="button" 
                className="btn-royal-gold btn-sm"
                style={{ flex: 1 }}
                onClick={() => handleQuickPaidPreset('FULL')}
              >
                Full Paid
              </button>
              <button 
                type="button" 
                className="btn-royal-outline btn-sm"
                style={{ flex: 1 }}
                onClick={() => handleQuickPaidPreset('HALF')}
              >
                50% Advance
              </button>
              <button 
                type="button" 
                className="btn-royal-outline btn-sm"
                style={{ flex: 1 }}
                onClick={() => handleQuickPaidPreset('ZERO')}
              >
                ₹0 (Khata)
              </button>
            </div>

            <div className="input-with-symbol" style={{ marginBottom: '0.75rem' }}>
              <span className="input-symbol-prefix">₹</span>
              <input
                type="number"
                className="form-input"
                style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803d' }}
                value={amountPaid || ''}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                placeholder="Amount received"
              />
            </div>

            {/* Payment Mode */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginBottom: '0.75rem' }}>
              {(['UPI', 'CASH', 'CARD'] as PaymentMethod[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: paymentMode === mode ? 800 : 500,
                    background: paymentMode === mode ? '#3f0913' : '#f5ecd9',
                    color: paymentMode === mode ? '#f7e7be' : '#3f0913',
                    border: 'none'
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Balance Due Display */}
            <div style={{ 
              background: balanceDue > 0 ? '#fef2f2' : '#ecfdf5',
              border: `1px solid ${balanceDue > 0 ? '#fecaca' : '#bbf7d0'}`,
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#666' }}>Balance Due:</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: balanceDue > 0 ? '#b91c1c' : '#15803d' }}>
                  {formatCurrency(balanceDue)}
                </div>
              </div>
              <span className={`badge ${balanceDue > 0 ? 'badge-partial' : 'badge-paid'}`}>
                {balanceDue > 0 ? 'PARTIALLY PAID' : 'FULL PAID'}
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button 
                type="button" 
                className="btn-royal-gold" 
                style={{ width: '100%', fontSize: '1rem', padding: '0.85rem' }}
                onClick={handleRequestPreviewAndPrint}
                title="Generate & Print Draft (F4)"
              >
                <FileCheck size={18} /> Generate & Print Invoice (F4)
              </button>

              <button 
                type="button" 
                className="btn-royal-primary" 
                style={{ width: '100%' }}
                onClick={handleRequestSaveToDatabase}
              >
                Save Bill to Database
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Sticky Mobile Action Bar for Phone Users */}
      <div className="mobile-billing-bottom-bar no-print">
        <div className="mobile-bottom-info">
          <span className="mobile-bottom-label">Grand Total ({items.length} items)</span>
          <span className="mobile-bottom-value">{formatCurrency(grandTotal)}</span>
        </div>
        <button 
          type="button" 
          className="btn-royal-gold mobile-bottom-submit-btn"
          onClick={handleRequestPreviewAndPrint}
        >
          <FileCheck size={18} />
          <span>Generate Bill</span>
        </button>
      </div>

      {/* Double Check Confirmation Modal before Saving to Database */}
      {showConfirmModal && pendingInvoice && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '440px', padding: 0, overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(135deg, #3f0913 0%, #220308 100%)',
              color: '#f7e7be',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              borderBottom: '2px solid #c59b48'
            }}>
              <AlertCircle size={24} color="#e6ca65" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f7e7be' }}>Double-Check: Save Bill?</h3>
                <span style={{ fontSize: '0.75rem', color: '#dfc794' }}>डेटाबेस में सुरक्षित करने से पहले जाँचें</span>
              </div>
            </div>

            <div style={{ padding: '1.25rem', background: '#faf7f2' }}>
              <p style={{ fontSize: '0.88rem', color: '#444', marginBottom: '1rem' }}>
                क्या आप इस बिल को डेटाबेस में सुरक्षित (Save) करना चाहते हैं?
              </p>

              <div style={{
                background: '#ffffff',
                border: '1px solid #ebdcc5',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                fontSize: '0.85rem',
                lineHeight: '1.6',
                marginBottom: '1.25rem'
              }}>
                <div><strong>Customer:</strong> {pendingInvoice.customer.name} ({pendingInvoice.customer.mobile})</div>
                <div><strong>Items:</strong> {pendingInvoice.items.length} item(s)</div>
                <div><strong>Grand Total:</strong> <strong style={{ color: '#886226', fontSize: '1rem' }}>{formatCurrency(pendingInvoice.grandTotal)}</strong></div>
                <div><strong>Amount Paid:</strong> {formatCurrency(pendingInvoice.amountPaid)}</div>
                {pendingInvoice.balanceDue > 0 ? (
                  <div style={{ color: '#b91c1c' }}><strong>Balance Due:</strong> {formatCurrency(pendingInvoice.balanceDue)}</div>
                ) : (
                  <div style={{ color: '#15803d' }}><strong>Payment:</strong> FULL PAID</div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-royal-outline"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel (रद्द करें)
                </button>
                <button
                  type="button"
                  className="btn-royal-gold"
                  onClick={() => {
                    setShowConfirmModal(false);
                    onSaveInvoice(pendingInvoice, false);
                  }}
                >
                  Confirm & Save to DB
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

