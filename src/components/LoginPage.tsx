import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  AlertTriangle, 
  Building2, 
  KeyRound,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { ShopSettings } from '../types';
import { signInWithGoogle, signOutGoogle, fetchSettingsFromCloud } from '../firebase';
import { saveShopSettings } from '../utils/storage';

interface LoginPageProps {
  settings: ShopSettings;
  onLoginSuccess: (userEmail: string) => void;
  onUpdateAuthorizedGmail: (newEmail: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  settings,
  onLoginSuccess,
  onUpdateAuthorizedGmail
}) => {
  const primaryOwnerEmail = 'manialankar3@gmail.com';
  
  // Whitelist: permanent primary owner + all added staff/family emails from settings
  const authorizedEmails: string[] = Array.from(new Set([
    primaryOwnerEmail,
    'ayushofficial2323@gmail.com',
    ...(settings.authorizedGmails || []),
    settings.authorizedGmail || '',
    settings.email || ''
  ])).map(e => e.trim().toLowerCase()).filter(Boolean);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Authenticate strictly via official Google OAuth Popup
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsAuthenticating(true);

    try {
      const res = await signInWithGoogle();
      setIsAuthenticating(false);

      if (!res.success) {
        setErrorMessage(res.error || 'Google Sign-In was cancelled or failed.');
        return;
      }

      const verifiedEmail = (res.email || '').toLowerCase().trim();

      // Check live Cloud Firestore as the authoritative source across all devices
      let isAllowed = false;
      try {
        const cloudSettings = await fetchSettingsFromCloud();
        if (cloudSettings) {
          const cloudEmails: string[] = Array.from(new Set([
            primaryOwnerEmail,
            'ayushofficial2323@gmail.com',
            ...(cloudSettings.authorizedGmails || []),
            cloudSettings.authorizedGmail || '',
            cloudSettings.email || ''
          ])).map(e => e.trim().toLowerCase()).filter(Boolean);

          isAllowed = cloudEmails.includes(verifiedEmail);
          // Synchronize authoritative cloud settings to local storage
          saveShopSettings(cloudSettings);
        } else {
          // Fallback if cloud settings unreachable
          isAllowed = authorizedEmails.includes(verifiedEmail);
        }
      } catch (fetchErr) {
        console.warn('Could not verify against cloud settings, using local fallback:', fetchErr);
        isAllowed = authorizedEmails.includes(verifiedEmail);
      }

      if (isAllowed) {
        localStorage.setItem('mani_alankar_auth_user', verifiedEmail);
        onLoginSuccess(verifiedEmail);
      } else {
        // Sign out immediately from Google session and clear any cached user
        await signOutGoogle();
        localStorage.removeItem('mani_alankar_auth_user');
        setErrorMessage(
          `Access Denied: The Google Account "${verifiedEmail}" is not authorized. ` +
          `Only registered owners and active staff in the whitelist can access Mani Alankar Jewellers.`
        );
      }
    } catch (err: any) {
      setIsAuthenticating(false);
      setErrorMessage(err.message || 'Authentication error occurred.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, #3f0913 0%, #200308 55%, #140104 100%)',
      padding: '1.25rem',
      position: 'relative'
    }}>
      
      {/* Background Top Ornate Accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #c59b48, #f7e7be, #c59b48)'
      }} />

      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '16px',
        border: '2px solid #d4b26f',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 25px rgba(197, 155, 72, 0.25)',
        overflow: 'hidden'
      }}>
        
        {/* Royal Gold/Maroon Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2b040b 0%, #460914 60%, #240308 100%)',
          padding: '2.25rem 1.75rem 1.75rem',
          textAlign: 'center',
          borderBottom: '2px solid #c59b48',
          position: 'relative'
        }}>
          
          {/* Logo with Glow Ring */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
            <img 
              src="/mani_alankar_logo.jpg" 
              alt="Mani Alankar Jewellers" 
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: '2.5px solid #e6ca65',
                boxShadow: '0 0 22px rgba(230, 202, 101, 0.5)',
                objectFit: 'cover',
                background: '#faf7f2'
              }}
            />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.65rem',
            fontWeight: 800,
            color: '#f7e7be',
            margin: '0 0 6px 0',
            letterSpacing: '0.06em',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)'
          }}>
            MANI ALANKAR JEWELLERS
          </h1>
          
          <div style={{
            fontSize: '0.74rem',
            color: '#dfc794',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 600
          }}>
            Authorized Staff & Owner Terminal &bull; GST Portal
          </div>
        </div>

        {/* Login Body */}
        <div style={{ padding: '2rem 1.75rem' }}>
          
          {/* Security Badge */}
          <div style={{
            background: '#fcf8ee',
            border: '1px solid #ebdcc5',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.75rem'
          }}>
            <ShieldCheck size={26} color="#15803d" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#3f0913' }}>
                Secure Google Identity Verification
              </div>
              <div style={{ fontSize: '0.74rem', color: '#684507', marginTop: '2px', lineHeight: '1.4' }}>
                Access is strictly restricted to pre-approved shop owner and staff Google accounts.
              </div>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div style={{
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              borderRadius: '8px',
              padding: '0.9rem 1rem',
              color: '#b91c1c',
              fontSize: '0.82rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              lineHeight: '1.4'
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Official Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isAuthenticating}
            style={{
              width: '100%',
              background: '#ffffff',
              border: '1.5px solid #c59b48',
              borderRadius: '12px',
              padding: '0.9rem 1.25rem',
              fontSize: '0.96rem',
              fontWeight: 700,
              color: '#2b040b',
              cursor: isAuthenticating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.85rem',
              boxShadow: '0 4px 15px rgba(197, 155, 72, 0.25)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              marginBottom: '1.25rem'
            }}
            onMouseOver={(e) => {
              if (!isAuthenticating) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(197, 155, 72, 0.35)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(197, 155, 72, 0.25)';
            }}
          >
            {isAuthenticating ? (
              <span style={{ color: '#886226', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #c59b48', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                Authenticating with Google...
              </span>
            ) : (
              <>
                {/* Official Google 'G' Icon */}
                <svg width="22" height="22" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Sign In with Google Account</span>
              </>
            )}
          </button>

          {/* Security Explanation Note */}
          <div style={{
            fontSize: '0.75rem',
            color: '#777777',
            textAlign: 'center',
            lineHeight: '1.45'
          }}>
            Click above to authenticate securely with your Google account.
            Only accounts whitelisted by Mani Alankar Jewellers management will be granted access.
          </div>

        </div>

        {/* Footer */}
        <div style={{
          background: '#fcfbf8',
          borderTop: '1px solid #ebdcc5',
          padding: '0.85rem 1.25rem',
          textAlign: 'center',
          fontSize: '0.72rem',
          color: '#777'
        }}>
          Mani Alankar Jewellers &bull; Cloud Firestore Database &bull; BIS Hallmark Certified
        </div>

      </div>

    </div>
  );
};
