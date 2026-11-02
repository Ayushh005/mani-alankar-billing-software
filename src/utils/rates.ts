import { MetalRatesSnapshot } from '../types';

const RATES_STORAGE_KEY = 'mani_alankar_metal_rates';

export const DEFAULT_RATES: MetalRatesSnapshot = {
  gold24k: 7850, // Rs per gram
  gold22k: 7250, // Rs per gram (916 hallmark)
  gold18k: 5950, // Rs per gram (750 hallmark)
  silver: 98,    // Rs per gram (Silver 999/925)
  timestamp: new Date().toISOString(),
  isOverride: true,
  notes: 'Shop Owner Daily Set Rate'
};

export const getSavedRates = (): MetalRatesSnapshot => {
  try {
    const raw = localStorage.getItem(RATES_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading saved metal rates:', e);
  }
  return DEFAULT_RATES;
};

export const saveRates = (rates: MetalRatesSnapshot): void => {
  try {
    localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(rates));
  } catch (e) {
    console.error('Error saving metal rates:', e);
  }
};

export const getRateForPurity = (
  rates: MetalRatesSnapshot,
  metal: string,
  purity: string
): number => {
  if (metal === 'GOLD') {
    if (purity.includes('24K')) return rates.gold24k;
    if (purity.includes('22K') || purity.includes('916')) return rates.gold22k;
    if (purity.includes('18K') || purity.includes('750')) return rates.gold18k;
    if (purity.includes('14K')) return Math.round(rates.gold24k * 0.585);
    return rates.gold22k; // Default for retail ornaments is 22K 916
  }
  if (metal === 'SILVER') {
    if (purity.includes('925')) return Math.round(rates.silver * 0.95);
    return rates.silver;
  }
  return 0;
};
