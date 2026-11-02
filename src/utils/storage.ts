import { Invoice, PaymentRecord, ShopSettings } from '../types';
import { DEFAULT_RATES } from './rates';
import { round } from './calculations';

const SETTINGS_KEY = 'mani_alankar_shop_settings';
const INVOICES_KEY = 'mani_alankar_invoices_db';

export const DEFAULT_SETTINGS: ShopSettings = {
  shopName: 'MANI ALANKAR JEWELLERS',
  tagline: 'Royal Indian Jewellery & Hallmark Certified Ornaments',
  address: 'Shop No. 12, Gold Souk, Sarafa Bazaar',
  city: 'Jaipur',
  state: 'Rajasthan',
  pincode: '302003',
  phone: '+91 98290 12345',
  alternatePhone: '+91 94140 67890',
  email: 'manialankar3@gmail.com',
  authorizedGmail: 'manialankar3@gmail.com',
  authorizedGmails: ['manialankar3@gmail.com'],
  gstin: '08ABCDE1234F1Z5',
  pan: 'ABCDE1234F',
  bisHallmarkLicense: 'HM/C-8921045620',
  stateCode: '08',
  
  invoicePrefix: 'MA/2026-27/',
  currentFinancialYear: '2026-27',
  nextInvoiceSeq: 4, // Next invoice sequence
  
  defaultGstPercent: 3,
  defaultMakingChargeType: 'PERCENT',
  defaultMakingChargeValue: 12,
  
  bankName: 'HDFC Bank Ltd',
  accountNo: '50200089123456',
  ifsc: 'HDFC0001234',
  branch: 'Sarafa Bazaar Branch, Jaipur',
  upiId: 'manialankar@okhdfcbank',
  
  invoiceTerms: [
    'Certified 100% BIS Hallmark 916 / 750 Gold & 925 Silver Jewellery.',
    'Making charges are charged on gross/net weight as agreed upon.',
    'Exchange of old ornaments is subject to standard fire-assay / melt purity test.',
    'GST payable at standard 3% on retail supply of jewellery as per CBIC guidelines.',
    'Goods once sold can be exchanged within 7 days in original condition with this tax invoice.'
  ]
};

// Seed sample invoices for immediate demonstration of billing & pending payments
const SEED_INVOICES: Invoice[] = [
  {
    id: 'inv_101',
    invoiceNumber: 'MA/2026-27/0001',
    invoiceDate: '2026-10-18',
    customer: {
      name: 'Rameshwar Lal Sharma',
      mobile: '9828011223',
      address: 'Plot 45, Vidhyadhar Nagar',
      city: 'Jaipur',
      state: 'Rajasthan',
    },
    items: [
      {
        id: 'itm_1',
        metal: 'GOLD',
        purity: '22K (916)',
        description: 'Gold Designer Choker Necklace (Hallmarked 916)',
        hsnCode: '7113',
        grossWeight: 22.450,
        netWeight: 22.450,
        stoneWeight: 0,
        ratePerGram: 7250,
        metalValue: 162762.50,
        makingChargeType: 'PERCENT',
        makingChargeValue: 12,
        makingChargeAmount: 19531.50,
        stoneCharges: 0,
        totalItemAmount: 182294.00,
      },
      {
        id: 'itm_2',
        metal: 'GOLD',
        purity: '22K (916)',
        description: 'Matching Jhumka Earrings Pair',
        hsnCode: '7113',
        grossWeight: 10.120,
        netWeight: 10.120,
        stoneWeight: 0,
        ratePerGram: 7250,
        metalValue: 73370.00,
        makingChargeType: 'PERCENT',
        makingChargeValue: 14,
        makingChargeAmount: 10271.80,
        stoneCharges: 0,
        totalItemAmount: 83641.80,
      }
    ],
    metalValueTotal: 236132.50,
    makingChargesTotal: 29803.30,
    stoneChargesTotal: 0,
    grossAmount: 265935.80,
    exchangeDeduction: 0,
    discountAmount: 935.80,
    taxableAmount: 265000.00,
    isInterState: false,
    gstPercent: 3,
    cgstRate: 1.5,
    cgstAmount: 3975.00,
    sgstRate: 1.5,
    sgstAmount: 3975.00,
    igstRate: 0,
    igstAmount: 0,
    totalGst: 7950.00,
    roundOff: 0,
    grandTotal: 272950.00,
    amountPaid: 272950.00,
    balanceDue: 0,
    status: 'PAID',
    payments: [
      {
        id: 'pay_1',
        invoiceId: 'inv_101',
        amount: 272950.00,
        paymentMethod: 'UPI',
        transactionRef: 'UPI/2938472910/HDFC',
        paidAt: '2026-10-18T14:32:00Z',
        notes: 'Full payment via Google Pay'
      }
    ],
    ratesSnapshot: { ...DEFAULT_RATES },
    hallmarkCharge: 90,
    terms: DEFAULT_SETTINGS.invoiceTerms,
    createdAt: '2026-10-18T14:30:00Z',
    updatedAt: '2026-10-18T14:32:00Z'
  },
  {
    id: 'inv_102',
    invoiceNumber: 'MA/2026-27/0002',
    invoiceDate: '2026-10-20',
    customer: {
      name: 'Sunita Meena',
      mobile: '9414022334',
      address: 'Sector 3, Malviya Nagar',
      city: 'Jaipur',
      state: 'Rajasthan',
    },
    items: [
      {
        id: 'itm_3',
        metal: 'GOLD',
        purity: '22K (916)',
        description: '22K Solid Gold Bridal Kada Pair',
        hsnCode: '7113',
        grossWeight: 35.800,
        netWeight: 35.800,
        stoneWeight: 0,
        ratePerGram: 7250,
        metalValue: 259550.00,
        makingChargeType: 'PERCENT',
        makingChargeValue: 10,
        makingChargeAmount: 25955.00,
        stoneCharges: 0,
        totalItemAmount: 285505.00,
      }
    ],
    metalValueTotal: 259550.00,
    makingChargesTotal: 25955.00,
    stoneChargesTotal: 0,
    grossAmount: 285505.00,
    oldGoldExchange: {
      description: 'Old 20K Bangles Melting Exchange',
      metal: 'GOLD',
      purity: '20K',
      grossWeight: 15.000,
      netWeight: 15.000,
      ratePerGram: 6400,
      meltingDeductionPercent: 2,
      totalExchangeAmount: 94080.00
    },
    exchangeDeduction: 94080.00,
    discountAmount: 1425.00,
    taxableAmount: 190000.00,
    isInterState: false,
    gstPercent: 3,
    cgstRate: 1.5,
    cgstAmount: 2850.00,
    sgstRate: 1.5,
    sgstAmount: 2850.00,
    igstRate: 0,
    igstAmount: 0,
    totalGst: 5700.00,
    roundOff: 0,
    grandTotal: 195700.00,
    amountPaid: 120000.00,
    balanceDue: 75700.00,
    status: 'PARTIAL',
    payments: [
      {
        id: 'pay_2',
        invoiceId: 'inv_102',
        amount: 70000.00,
        paymentMethod: 'CASH',
        paidAt: '2026-10-20T16:20:00Z',
        notes: 'Initial cash token'
      },
      {
        id: 'pay_3',
        invoiceId: 'inv_102',
        amount: 50000.00,
        paymentMethod: 'UPI',
        transactionRef: 'UPI/7839210943/PAYTM',
        paidAt: '2026-10-21T11:15:00Z',
        notes: 'Part payment via Paytm'
      }
    ],
    ratesSnapshot: { ...DEFAULT_RATES },
    hallmarkCharge: 45,
    terms: DEFAULT_SETTINGS.invoiceTerms,
    createdAt: '2026-10-20T16:15:00Z',
    updatedAt: '2026-10-21T11:15:00Z'
  },
  {
    id: 'inv_103',
    invoiceNumber: 'MA/2026-27/0003',
    invoiceDate: '2026-10-21',
    customer: {
      name: 'Vikas Agarwal',
      mobile: '9829033445',
      address: 'C-Scheme, Ashok Nagar',
      city: 'Jaipur',
      state: 'Rajasthan',
    },
    items: [
      {
        id: 'itm_4',
        metal: 'SILVER',
        purity: 'Silver 925 (Sterling)',
        description: 'Sterling Silver Luxury Dinner Thali Set',
        hsnCode: '7106',
        grossWeight: 750.000,
        netWeight: 750.000,
        stoneWeight: 0,
        ratePerGram: 95,
        metalValue: 71250.00,
        makingChargeType: 'PER_GRAM',
        makingChargeValue: 15,
        makingChargeAmount: 11250.00,
        stoneCharges: 0,
        totalItemAmount: 82500.00,
      }
    ],
    metalValueTotal: 71250.00,
    makingChargesTotal: 11250.00,
    stoneChargesTotal: 0,
    grossAmount: 82500.00,
    exchangeDeduction: 0,
    discountAmount: 500.00,
    taxableAmount: 82000.00,
    isInterState: false,
    gstPercent: 3,
    cgstRate: 1.5,
    cgstAmount: 1230.00,
    sgstRate: 1.5,
    sgstAmount: 1230.00,
    igstRate: 0,
    igstAmount: 0,
    totalGst: 2460.00,
    roundOff: 0,
    grandTotal: 84460.00,
    amountPaid: 0,
    balanceDue: 84460.00,
    status: 'UNPAID',
    payments: [],
    ratesSnapshot: { ...DEFAULT_RATES },
    terms: DEFAULT_SETTINGS.invoiceTerms,
    createdAt: '2026-10-21T12:05:00Z',
    updatedAt: '2026-10-21T12:05:00Z'
  }
];

export const getShopSettings = (): ShopSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const authorizedGmails = Array.isArray(parsed.authorizedGmails) && parsed.authorizedGmails.length > 0
        ? Array.from(new Set(['manialankar3@gmail.com', ...parsed.authorizedGmails.map((e: string) => e.trim().toLowerCase())]))
        : ['manialankar3@gmail.com'];
      return { 
        ...DEFAULT_SETTINGS, 
        ...parsed, 
        authorizedGmail: 'manialankar3@gmail.com',
        authorizedGmails 
      };
    }
  } catch (e) {
    console.error('Error reading settings:', e);
  }
  return DEFAULT_SETTINGS;
};

export const saveShopSettings = (settings: ShopSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
};

export const getInvoices = (): Invoice[] => {
  try {
    const raw = localStorage.getItem(INVOICES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    // Seed initial demo data on first load
    localStorage.setItem(INVOICES_KEY, JSON.stringify(SEED_INVOICES));
    return SEED_INVOICES;
  } catch (e) {
    console.error('Error reading invoices:', e);
    return SEED_INVOICES;
  }
};

export const saveInvoices = (invoices: Invoice[]): void => {
  try {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  } catch (e) {
    console.error('Error saving invoices:', e);
  }
};

export const addInvoice = (invoice: Invoice): Invoice => {
  const invoices = getInvoices();
  const updated = [invoice, ...invoices];
  saveInvoices(updated);

  // Increment sequence
  const settings = getShopSettings();
  settings.nextInvoiceSeq = (settings.nextInvoiceSeq || 1) + 1;
  saveShopSettings(settings);

  return invoice;
};

// Partial payment update: directly implements the workflow discussed in the ChatGPT reference!
export const recordPaymentOnInvoice = (
  invoiceId: string,
  amount: number,
  method: PaymentRecord['paymentMethod'],
  ref?: string,
  notes?: string
): Invoice | null => {
  const invoices = getInvoices();
  const index = invoices.findIndex(i => i.id === invoiceId);
  if (index === -1) return null;

  const target = invoices[index];
  const paymentAmount = round(Math.min(amount, target.balanceDue));

  const newPayment: PaymentRecord = {
    id: `pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    invoiceId,
    amount: paymentAmount,
    paymentMethod: method,
    transactionRef: ref,
    paidAt: new Date().toISOString(),
    notes: notes || 'Partial/Additional Payment'
  };

  const updatedPayments = [...(target.payments || []), newPayment];
  const newAmountPaid = round(updatedPayments.reduce((sum, p) => sum + p.amount, 0));
  const newBalanceDue = round(Math.max(0, target.grandTotal - newAmountPaid));
  
  let newStatus: Invoice['status'] = 'UNPAID';
  if (newBalanceDue === 0) {
    newStatus = 'PAID';
  } else if (newAmountPaid > 0) {
    newStatus = 'PARTIAL';
  }

  const updatedInvoice: Invoice = {
    ...target,
    payments: updatedPayments,
    amountPaid: newAmountPaid,
    balanceDue: newBalanceDue,
    status: newStatus,
    updatedAt: new Date().toISOString()
  };

  invoices[index] = updatedInvoice;
  saveInvoices(invoices);
  return updatedInvoice;
};

export const exportDatabaseJSON = (): string => {
  const data = {
    settings: getShopSettings(),
    invoices: getInvoices(),
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  };
  return JSON.stringify(data, null, 2);
};

export const importDatabaseJSON = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.settings && data.invoices) {
      saveShopSettings(data.settings);
      saveInvoices(data.invoices);
      return true;
    }
  } catch (e) {
    console.error('Import failed:', e);
  }
  return false;
};
