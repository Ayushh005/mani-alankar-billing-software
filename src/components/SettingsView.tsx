import React, { useState } from 'react';
import { 
  Building2, 
  Receipt, 
  CreditCard, 
  Save, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
  Cloud,
  CloudUpload,
  CloudDownload
} from 'lucide-react';
import { ShopSettings } from '../types';
import { getInvoices, saveInvoices } from '../utils/storage';
import { 
  isFirebaseConfigured, 
  syncAllInvoicesToCloud, 
  fetchInvoicesFromCloud 
} from '../firebase';

interface SettingsViewProps {
  settings: ShopSettings;
  onSaveSettings: (settings: ShopSettings) => void;
  onDatabaseReset?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings
}) => {
  const [formData, setFormData] = useState<ShopSettings>(() => {
    const list = settings.authorizedGmails && settings.authorizedGmails.length > 0
      ? Array.from(new Set(['manialankar3@gmail.com', ...settings.authorizedGmails]))
      : ['manialankar3@gmail.com'];
    return {
      ...settings,
      authorizedGmail: 'manialankar3@gmail.com',
      authorizedGmails: list
    };
  });

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [newEmailInput, setNewEmailInput] = useState<string>('');
  
  // Cloud Sync State
  const [cloudSyncMsg, setCloudSyncMsg] = useState<string | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);

  const handleChange = (field: keyof ShopSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', color: '#3f0913', margin: 0 }}>
          Shop Profile & Software Settings
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#666', margin: '3px 0 0 0' }}>
          Configure Mani Alankar business information, authorized Gmail login accounts, GSTIN, and Firebase cloud sync.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Card 1: Shop Information */}
        <div className="royal-card">
          <div className="royal-card-header">
            <h3 className="royal-card-title">
              <Building2 size={18} color="#3f0913" />
              1. Shop Branding & Contact Particulars
            </h3>
          </div>

          <div className="royal-card-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Shop / Trade Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.shopName}
                  onChange={(e) => handleChange('shopName', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tagline / Subtitle</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-3" style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Shop Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-grid-3" style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">PIN Code *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 302003"
                  value={formData.pincode || ''}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Store Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
            </div>

            {/* AUTHORIZED GMAIL WHITELIST MANAGEMENT */}
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{
                background: '#fcfbf7',
                border: '1.5px solid #d4c7b2',
                borderRadius: '10px',
                padding: '1.1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={20} color="#15803d" />
                    <strong style={{ fontSize: '0.92rem', color: '#3f0913' }}>
                      Authorized Gmail Login Whitelist (अधिकृत जीमेल खाता प्रबंधन)
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#15803d', background: '#ecfdf5', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    Active Security Whitelist
                  </span>
                </div>

                <p style={{ fontSize: '0.76rem', color: '#684507', margin: '0 0 0.85rem 0' }}>
                  इस सॉफ्टवेयर में केवल वही व्यक्ति लॉगिन कर सकता है जिसका Gmail ID नीचे दी गई लिस्ट में शामिल है। कोई भी बाहरी व्यक्ति इस सॉफ्टवेयर को नहीं खोल पाएगा।
                </p>

                {/* Primary Permanent Owner */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                  border: '1.5px solid #c59b48',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  marginBottom: '0.6rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#16a34a' }} />
                    <div>
                      <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: '#2b040b' }}>
                        manialankar3@gmail.com
                      </strong>
                      <div style={{ fontSize: '0.7rem', color: '#886226', fontWeight: 600 }}>
                        Main Super Owner Account (Permanent &bull; मुख्य दुकान मालिक)
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#3f0913', background: '#f7e7be', padding: '3px 8px', borderRadius: '4px' }}>
                    Primary Owner
                  </span>
                </div>

                {/* Additional Authorized Emails List */}
                {formData.authorizedGmails && formData.authorizedGmails.filter(e => e.toLowerCase() !== 'manialankar3@gmail.com').map((email, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#ffffff',
                      border: '1px solid #ebdcc5',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      marginBottom: '0.4rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2563eb' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#333', fontWeight: 600 }}>
                        {email}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (formData.authorizedGmails || []).filter(e => e.toLowerCase() !== email.toLowerCase());
                        handleChange('authorizedGmails', updated);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#b91c1c',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                ))}

                {/* Input to Add New Authorized Gmail */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Add staff / family Gmail (e.g. staff@gmail.com)"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    style={{ flex: 1, fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    className="btn-royal-primary btn-sm"
                    onClick={() => {
                      const clean = newEmailInput.trim().toLowerCase();
                      if (!clean || !clean.includes('@') || !clean.includes('.')) {
                        alert('Please enter a valid Gmail address');
                        return;
                      }
                      const current = formData.authorizedGmails || ['manialankar3@gmail.com'];
                      if (current.map(e => e.toLowerCase()).includes(clean)) {
                        alert(`"${clean}" is already in the authorized whitelist.`);
                        return;
                      }
                      const updated = [...current, clean];
                      handleChange('authorizedGmails', updated);
                      setNewEmailInput('');
                    }}
                  >
                    <Plus size={14} /> Add to Whitelist
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Card 2: Legal GST & BIS Hallmark Identifiers */}
        <div className="royal-card">
          <div className="royal-card-header">
            <h3 className="royal-card-title">
              <Receipt size={18} color="#c59b48" />
              2. Government Identifiers & Tax Compliance
            </h3>
          </div>

          <div className="royal-card-body">
            <div className="form-grid-4">
              <div className="form-group">
                <label className="form-label">GSTIN No *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.gstin}
                  onChange={(e) => handleChange('gstin', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">PAN Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.pan}
                  onChange={(e) => handleChange('pan', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">State Code (GST)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.stateCode}
                  onChange={(e) => handleChange('stateCode', e.target.value)}
                  placeholder="08 (Bihar)"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">BIS Hallmark License *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.bisHallmarkLicense}
                  onChange={(e) => handleChange('bisHallmarkLicense', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Banking & UPI Details */}
        <div className="royal-card">
          <div className="royal-card-header">
            <h3 className="royal-card-title">
              <CreditCard size={18} color="#c59b48" />
              3. Bank Details for Invoice & Payment Collection
            </h3>
          </div>

          <div className="royal-card-body">
            <div className="form-grid-4">
              <div className="form-group">
                <label className="form-label">Bank Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.accountNo}
                  onChange={(e) => handleChange('accountNo', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">IFSC Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.ifsc}
                  onChange={(e) => handleChange('ifsc', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">UPI ID (Google Pay / PhonePe)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.upiId}
                  onChange={(e) => handleChange('upiId', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div style={{ 
            marginBottom: '1rem', 
            padding: '0.75rem 1.25rem', 
            background: '#ecfdf5', 
            border: '1px solid #bbf7d0', 
            borderRadius: '8px',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 700
          }}>
            <CheckCircle2 size={18} /> Settings and authorized Gmail whitelist saved successfully!
          </div>
        )}

        {/* Save Settings Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2.5rem' }}>
          <button type="submit" className="btn-royal-gold" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            <Save size={18} /> Save Settings & Whitelist
          </button>
        </div>

      </form>

      {/* Card 4: Cloud Database (Firebase Firestore) Sync */}
      <div className="royal-card" style={{ marginBottom: '1.5rem' }}>
        <div className="royal-card-header">
          <h3 className="royal-card-title">
            <Cloud size={18} color="#0284c7" />
            4. Cloud Database & Remote Backup (Firebase Firestore)
          </h3>
        </div>

        <div className="royal-card-body">
          <div style={{
            background: isFirebaseConfigured() ? '#f0fdf4' : '#fffbeb',
            border: `1.5px solid ${isFirebaseConfigured() ? '#86efac' : '#fde68a'}`,
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isFirebaseConfigured() ? '#16a34a' : '#d97706'
              }} />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: isFirebaseConfigured() ? '#15803d' : '#92400e' }}>
                  {isFirebaseConfigured() ? 'Firebase Cloud Connected (रियल-टाइम क्लाउड सिंक चालू है)' : 'Local Storage Mode (लाइव होने पर क्लाउड सिंक होगा)'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                  {isFirebaseConfigured() 
                    ? 'All new bills and payments are automatically mirrored to Google Cloud Firestore in real-time.' 
                    : 'Currently saving on local disk.'}
                </div>
              </div>
            </div>
          </div>

          {/* Cloud Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <button
              type="button"
              className="btn-royal-primary"
              disabled={isSyncingCloud}
              onClick={async () => {
                setIsSyncingCloud(true);
                setCloudSyncMsg(null);
                const allInvoices = getInvoices();
                const success = await syncAllInvoicesToCloud(allInvoices);
                setIsSyncingCloud(false);
                if (success) {
                  setCloudSyncMsg(`✓ Successfully synced ${allInvoices.length} invoices to Google Cloud Firestore!`);
                } else {
                  setCloudSyncMsg('Failed to sync. Please check your internet connection.');
                }
                setTimeout(() => setCloudSyncMsg(null), 5000);
              }}
            >
              <CloudUpload size={16} /> {isSyncingCloud ? 'Syncing to Cloud...' : 'Sync All Invoices to Cloud (क्लाउड पर सेव करें)'}
            </button>

            <button
              type="button"
              className="btn-royal-outline"
              disabled={isSyncingCloud}
              onClick={async () => {
                setIsSyncingCloud(true);
                setCloudSyncMsg(null);
                const cloudList = await fetchInvoicesFromCloud();
                setIsSyncingCloud(false);
                if (cloudList && cloudList.length > 0) {
                  saveInvoices(cloudList);
                  setCloudSyncMsg(`✓ Downloaded ${cloudList.length} invoices from Google Cloud! Reloading...`);
                  setTimeout(() => window.location.reload(), 1200);
                } else if (cloudList && cloudList.length === 0) {
                  setCloudSyncMsg('Cloud database is currently empty.');
                } else {
                  setCloudSyncMsg('Could not reach Cloud. Check your internet connection.');
                }
              }}
            >
              <CloudDownload size={16} /> Pull Latest from Cloud (क्लाउड से डेटा लाएं)
            </button>
          </div>

          {cloudSyncMsg && (
            <div style={{
              padding: '0.65rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: cloudSyncMsg.includes('✓') ? '#ecfdf5' : '#fef2f2',
              color: cloudSyncMsg.includes('✓') ? '#15803d' : '#b91c1c',
              border: `1px solid ${cloudSyncMsg.includes('✓') ? '#86efac' : '#fca5a5'}`,
              marginTop: '0.75rem'
            }}>
              {cloudSyncMsg}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
