import { InvoiceItem, MakingChargeType, OldGoldExchange } from '../types';

export const round = (num: number, decimals: number = 2): number => {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatGrams = (grams: number): string => {
  return `${Number(grams || 0).toFixed(3)} g`;
};

export const calculateMakingCharge = (
  metalValue: number,
  netWeight: number,
  type: MakingChargeType,
  value: number
): number => {
  if (type === 'PERCENT') {
    return round((metalValue * (value || 0)) / 100);
  } else if (type === 'PER_GRAM') {
    return round((netWeight || 0) * (value || 0));
  } else {
    // FIXED
    return round(Number(value) || 0);
  }
};

export const calculateItemTotals = (
  item: Omit<InvoiceItem, 'metalValue' | 'makingChargeAmount' | 'totalItemAmount' | 'wastageAmount'> & {
    netWeight?: number;
    totalItemAmount?: number;
  }
): InvoiceItem => {
  const netWeight = item.netWeight !== undefined && item.netWeight !== null 
    ? Math.max(0, Number(item.netWeight)) 
    : Math.max(0, (item.grossWeight || 0) - (item.stoneWeight || 0));

  const metalValue = round(netWeight * (item.ratePerGram || 0));
  
  const makingChargeAmount = calculateMakingCharge(
    metalValue,
    netWeight,
    item.makingChargeType,
    item.makingChargeValue
  );

  const wastageAmount = item.wastagePercent 
    ? round((metalValue * item.wastagePercent) / 100)
    : 0;

  const stoneCharges = Number(item.stoneCharges) || 0;
  
  const totalItemAmount = item.totalItemAmount !== undefined && item.totalItemAmount !== null
    ? round(Number(item.totalItemAmount))
    : round(metalValue + makingChargeAmount + wastageAmount + stoneCharges);

  return {
    ...item,
    netWeight,
    metalValue,
    makingChargeAmount,
    wastageAmount,
    stoneCharges,
    totalItemAmount,
  };
};

export const calculateOldGoldExchange = (
  exchange: Omit<OldGoldExchange, 'totalExchangeAmount'>
): OldGoldExchange => {
  const netWeight = Math.max(0, (exchange.grossWeight || 0) - 0);
  const rawValue = round(netWeight * (exchange.ratePerGram || 0));
  const deduction = round((rawValue * (exchange.meltingDeductionPercent || 0)) / 100);
  const totalExchangeAmount = round(Math.max(0, rawValue - deduction));

  return {
    ...exchange,
    netWeight,
    totalExchangeAmount,
  };
};

// Indian Number to Words converter for GST Tax Invoices
const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

const convertLessThanOneThousand = (num: number): string => {
  let str = '';
  if (num >= 100) {
    str += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  if (num >= 20) {
    str += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  if (num > 0) {
    str += ones[num] + ' ';
  }
  return str.trim();
};

export const numberToWordsINR = (amount: number): string => {
  if (amount === 0) return 'Rupees Zero Only';

  const rounded = round(amount);
  const wholePart = Math.floor(rounded);
  const paisePart = Math.round((rounded - wholePart) * 100);

  let num = wholePart;
  let words = '';

  const crores = Math.floor(num / 10000000);
  num %= 10000000;

  const lakhs = Math.floor(num / 100000);
  num %= 100000;

  const thousands = Math.floor(num / 1000);
  num %= 1000;

  const hundreds = num;

  if (crores > 0) {
    words += convertLessThanOneThousand(crores) + ' Crore ';
  }
  if (lakhs > 0) {
    words += convertLessThanOneThousand(lakhs) + ' Lakh ';
  }
  if (thousands > 0) {
    words += convertLessThanOneThousand(thousands) + ' Thousand ';
  }
  if (hundreds > 0) {
    words += convertLessThanOneThousand(hundreds) + ' ';
  }

  words = words.trim();
  let result = `Rupees ${words}`;

  if (paisePart > 0) {
    result += ` and ${convertLessThanOneThousand(paisePart)} Paise`;
  }

  result += ' Only';
  return result;
};
