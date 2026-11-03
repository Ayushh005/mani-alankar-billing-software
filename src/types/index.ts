export type MetalType = 'GOLD' | 'SILVER' | 'DIAMOND' | 'PLATINUM' | 'ARTIFICIAL';

export type GoldPurity = '24K' | '22K (916)' | '18K (750)' | '14K (585)';
export type SilverPurity = 'Silver 999' | 'Silver 925 (Sterling)' | 'Silver 800';
export type MetalPurity = GoldPurity | SilverPurity | string;

export type MakingChargeType = 'PERCENT' | 'PER_GRAM' | 'FIXED';

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'NET_BANKING' | 'CHEQUE';

export type InvoiceStatus = 'PAID' | 'PARTIAL' | 'UNPAID';

export interface InvoiceItem {
  id: string;
  metal: MetalType;
  purity: string;
  description: string;
  hsnCode: string;
  grossWeight: number; // in grams
  netWeight: number;   // in grams (gross - stone)
  stoneWeight: number; // in carats or grams
  ratePerGram: number; // base rate
  metalValue: number;  // netWeight * ratePerGram
  makingChargeType: MakingChargeType;
  makingChargeValue: number; // e.g. 10% or Rs 450/g or Rs 2500 fixed
  makingChargeAmount: number; // calculated rupees
  wastagePercent?: number;    // optional wastage %
  wastageAmount?: number;     // calculated rupees
  stoneCharges?: number;      // other / stone charges
  totalItemAmount: number;    // metalValue + makingChargeAmount + wastageAmount + stoneCharges
}

export interface OldGoldExchange {
  description: string;
  metal: MetalType;
  purity: string;
  grossWeight: number;
  netWeight: number;
  ratePerGram: number;
  meltingDeductionPercent: number; // e.g. 2% or 5%
  totalExchangeAmount: number;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  paidAt: string; // ISO date string
  notes?: string;
}

export interface CustomerInfo {
  name: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  gstin?: string;
  pan?: string;
}

export interface MetalRatesSnapshot {
  gold24k: number; // per gram
  gold22k: number; // per gram
  gold18k: number; // per gram
  silver: number;  // per gram
  timestamp: string;
  isOverride: boolean;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. MA/2026-27/0001
  invoiceDate: string;   // YYYY-MM-DD
  customer: CustomerInfo;
  items: InvoiceItem[];
  
  // Calculations
  metalValueTotal: number;
  makingChargesTotal: number;
  stoneChargesTotal: number;
  grossAmount: number; // sum of items
  
  // Exchange and Discount
  oldGoldExchange?: OldGoldExchange;
  exchangeDeduction: number;
  discountAmount: number;
  taxableAmount: number; // gross - exchange - discount
  
  // GST
  isInterState: boolean; // if customer from another state -> IGST, else CGST+SGST
  gstPercent: number;    // standard 3% for jewellery
  cgstRate: number;      // 1.5%
  cgstAmount: number;
  sgstRate: number;      // 1.5%
  sgstAmount: number;
  igstRate: number;      // 3% or 0%
  igstAmount: number;
  totalGst: number;
  
  roundOff: number;
  grandTotal: number;
  
  // Payment Status
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  payments: PaymentRecord[];
  
  // Audit Snapshot
  ratesSnapshot: MetalRatesSnapshot;
  hallmarkCharge?: number;
  notes?: string;
  terms?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  authorizedGmail?: string;
  authorizedGmails?: string[];
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId: string;
  };
  gstin: string;
  pan: string;
  bisHallmarkLicense: string;
  stateCode: string;
  
  invoicePrefix: string;
  currentFinancialYear: string;
  nextInvoiceSeq: number;
  
  defaultGstPercent: number; // 3%
  defaultMakingChargeType: MakingChargeType;
  defaultMakingChargeValue: number;
  
  bankName: string;
  accountNo: string;
  ifsc: string;
  branch: string;
  upiId: string;
  
  invoiceTerms: string[];
}
