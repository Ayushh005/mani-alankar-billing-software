import React, { useState } from 'react';
import { 
  Coins, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Calculator,
  Calendar
} from 'lucide-react';
import { MetalRatesSnapshot } from '../types';
import { formatCurrency } from '../utils/calculations';

interface RatesViewProps {
  rates: MetalRatesSnapshot;
  onUpdateRates: (updated: MetalRatesSnapshot) => void;
}

export const RatesView: React.FC<RatesViewProps> = ({
  rates,
  onUpdateRates
}) => {
  const [gold24k, setGold24k] = useState<number | ''>(rates.gold24k || '');
  const [gold22k, setGold22k] = useState<number | ''>(rates.gold22k || '');
  const [gold18k, setGold18k] = useState<number | ''>(rates.gold18k || '');
  const [silver, setSilver] = useState<number | ''>(rates.silver || '');
  const [autoDerive, setAutoDerive] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>(rates.notes || 'Shop Owner Daily Set Rate');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // When rates prop updates, sync local inputs
  React.useEffect(() => {
    setGold24k(rates.gold24k || '');
    setGold22k(rates.gold22k || '');
    setGold18k(rates.gold18k || '');
    setSilver(rates.silver || '');
    setNotes(rates.notes || 'Shop Owner Daily Set Rate');
  }, [rates]);

  // Handle 24K changes with optional auto-calculation and leading zero removal
  const handle24kChange = (raw: string) => {
    const cleaned = raw.replace(/^0+(?=\d)/, '');
    if (cleaned === '') {
      setGold24k('');
      if (autoDerive) {
        setGold22k('');
        setGold18k('');
      }
      return;
    }
    const val = Number(cleaned);
    if (isNaN(val)) return;
    setGold24k(val);
    if (autoDerive) {
      setGold22k(Math.round(val * 0.923)); // 92.3% standard market ratio
      setGold18k(Math.round(val * 0.758)); // 75.8% standard ratio
    }
  };

  const handleRateChange = (raw: string, setter: (val: number | '') => void) => {
    const cleaned = raw.replace(/^0+(?=\d)/, '');
    if (cleaned === '') {
      setter('');
      return;
    }
    const val = Number(cleaned);
    if (isNaN(val)) return;
    setter(val);
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: MetalRatesSnapshot = {
      gold24k: Number(gold24k) || 0,
      gold22k: Number(gold22k) || 0,
      gold18k: Number(gold18k) || 0,
      silver: Number(silver) || 0,
      timestamp: new Date().toISOString(),
      isOverride: true,
      notes: notes.trim() || 'Manual Store Rate Update'
    };
    onUpdateRates(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #3f0913 0%, #200308 100%)', 
        borderRadius: '12px', 
        padding: '1.5rem 1.8rem', 
        color: '#ffffff',
        border: '1.5px solid #c59b48',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#e6ca65', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <Coins size={16} />
            <span>Store Pricing Master</span>
          </div>
          <h2 style={{ fontSize: '1.65rem', color: '#f7e7be', margin: '6px 0 4px 0', fontFamily: 'var(--font-serif)' }}>
            Daily Metal Rates Configuration
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#ded4c3', margin: 0, maxWidth: '650px' }}>
            Manually enter today's gold and silver rates. When you create new bills, the active rate set here will be automatically applied and permanently locked to that invoice.
          </p>
        </div>

        <div style={{ 
          background: 'rgba(0, 0, 0, 0.35)', 
          border: '1px solid rgba(230, 202, 101, 0.4)', 
          borderRadius: '10px', 
          padding: '0.75rem 1.25rem',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#dfc794', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Last Updated</div>
          <div style={{ fontSize: '0.92rem', color: '#ffffff', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
            <Calendar size={13} color="#e6ca65" />
            {new Date(rates.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#bbf7d0', marginTop: '2px' }}>
            Active Store Rate
          </div>
        </div>
      </div>

      {/* Live Board Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        {/* Card 1: 24K */}
        <div className="royal-card" style={{ marginBottom: 0 }}>
          <div style={{ background: '#fcf8ee', padding: '1rem', borderBottom: '1px solid #ebdcc5', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#886226', fontWeight: 800 }}>
              Fine Gold 99.9%
            </span>
            <h3 style={{ fontSize: '1.2rem', color: '#3f0913', margin: '2px 0 0 0' }}>24K Gold</h3>
          </div>
          <div style={{ padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#3f0913', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(rates.gold24k)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '2px' }}>Per 1 Gram</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#886226', marginTop: '6px', borderTop: '1px dashed #ded4c3', paddingTop: '6px' }}>
              10 Grams: {formatCurrency(rates.gold24k * 10)}
            </div>
          </div>
        </div>

        {/* Card 2: 22K (916) */}
        <div className="royal-card" style={{ marginBottom: 0, border: '2px solid #c59b48' }}>
          <div style={{ background: 'linear-gradient(135deg, #3f0913 0%, #200308 100%)', color: '#fff', padding: '1rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e6ca65', fontWeight: 800 }}>
              Retail Standard &bull; Hallmark 916
            </span>
            <h3 style={{ fontSize: '1.2rem', color: '#f7e7be', margin: '2px 0 0 0' }}>22K (916) Gold</h3>
          </div>
          <div style={{ padding: '1.2rem', textAlign: 'center', background: '#fffdf9' }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#3f0913', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(rates.gold22k)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '2px' }}>Per 1 Gram</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#886226', marginTop: '6px', borderTop: '1px dashed #ded4c3', paddingTop: '6px' }}>
              10 Grams: {formatCurrency(rates.gold22k * 10)}
            </div>
          </div>
        </div>

        {/* Card 3: 18K (750) */}
        <div className="royal-card" style={{ marginBottom: 0 }}>
          <div style={{ background: '#fcf8ee', padding: '1rem', borderBottom: '1px solid #ebdcc5', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#886226', fontWeight: 800 }}>
              Diamond Jewellery Base 750
            </span>
            <h3 style={{ fontSize: '1.2rem', color: '#3f0913', margin: '2px 0 0 0' }}>18K (750) Gold</h3>
          </div>
          <div style={{ padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#3f0913', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(rates.gold18k)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '2px' }}>Per 1 Gram</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#886226', marginTop: '6px', borderTop: '1px dashed #ded4c3', paddingTop: '6px' }}>
              10 Grams: {formatCurrency(rates.gold18k * 10)}
            </div>
          </div>
        </div>

        {/* Card 4: Silver */}
        <div className="royal-card" style={{ marginBottom: 0 }}>
          <div style={{ background: '#f5f5f5', padding: '1rem', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', fontWeight: 800 }}>
              Fine & Sterling Silver
            </span>
            <h3 style={{ fontSize: '1.2rem', color: '#333', margin: '2px 0 0 0' }}>Silver 999/925</h3>
          </div>
          <div style={{ padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#3f0913', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(rates.silver)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '2px' }}>Per 1 Gram</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#555', marginTop: '6px', borderTop: '1px dashed #ded4c3', paddingTop: '6px' }}>
              1 Kilogram: {formatCurrency(rates.silver * 1000)}
            </div>
          </div>
        </div>

      </div>

      {/* Manual Rate Configuration Form */}
      <div className="royal-card">
        <div className="royal-card-header">
          <h3 className="royal-card-title">
            <Sparkles size={18} color="#c59b48" />
            Set Today's Store Rates (Manual Entry)
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#666' }}>
            Note: {rates.notes || 'Manually entered store rate'}
          </span>
        </div>

        <form onSubmit={handleSaveManual}>
          <div className="royal-card-body">
            
            <div style={{ 
              background: '#fcfbf8', 
              border: '1px solid #dfc794', 
              borderRadius: '8px', 
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              color: '#444'
            }}>
              <ShieldCheck size={20} color="#15803d" />
              <span>
                <strong>Rate Snapshot Lock:</strong> When an invoice is created, the system takes a permanent snapshot of the rates at that moment. Updating rates here only affects newly generated bills, ensuring all past invoices and tax records remain 100% accurate.
              </span>
            </div>

            {/* Quick helper toggle */}
            <div style={{ 
              marginBottom: '1.25rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: '#555',
              cursor: 'pointer'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                <input 
                  type="checkbox" 
                  checked={autoDerive} 
                  onChange={(e) => setAutoDerive(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#c59b48', cursor: 'pointer' }}
                />
                <Calculator size={15} color="#886226" />
                <span>Auto-calculate 22K (92.3%) and 18K (75.8%) when entering 24K</span>
              </label>
            </div>

            <div className="form-grid-4">
              <div className="form-group">
                <label className="form-label">
                  <span>Gold 24K Rate (₹ / g)</span>
                </label>
                <div className="input-with-symbol">
                  <span className="input-symbol-prefix">₹</span>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={gold24k}
                    onChange={(e) => handle24kChange(e.target.value)}
                    required
                    min={1}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Gold 22K (916) (₹ / g)</span>
                </label>
                <div className="input-with-symbol">
                  <span className="input-symbol-prefix">₹</span>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={gold22k}
                    onChange={(e) => handleRateChange(e.target.value, setGold22k)}
                    required
                    min={1}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Gold 18K (750) (₹ / g)</span>
                </label>
                <div className="input-with-symbol">
                  <span className="input-symbol-prefix">₹</span>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={gold18k}
                    onChange={(e) => handleRateChange(e.target.value, setGold18k)}
                    required
                    min={1}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Silver (₹ / g)</span>
                </label>
                <div className="input-with-symbol">
                  <span className="input-symbol-prefix">₹</span>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={silver}
                    onChange={(e) => handleRateChange(e.target.value, setSilver)}
                    required
                    min={1}
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">Rate Remark / Reference (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. IBJA Morning Closing + Shop Margin, Festival Special Rate"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {savedSuccess && (
              <div style={{ 
                marginTop: '1.25rem', 
                padding: '0.75rem 1rem', 
                background: '#ecfdf5', 
                border: '1px solid #bbf7d0', 
                borderRadius: '8px',
                color: '#15803d',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontWeight: 600
              }}>
                <CheckCircle2 size={18} /> Today's shop metal rates saved successfully! All newly generated bills will use these rates.
              </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-royal-gold" style={{ padding: '0.7rem 1.75rem', fontSize: '0.95rem' }}>
                <Save size={18} /> Save Active Store Rates
              </button>
            </div>

          </div>
        </form>
      </div>

    </div>
  );
};
