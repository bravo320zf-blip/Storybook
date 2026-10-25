import React, { useState } from 'react';
import { LogIn, UserPlus, X, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userEmail: string, accessToken?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        const user = await signUpWithEmail(email, password, name);
        onAuthSuccess(user.email || email);
        onClose();
      } else {
        const user = await signInWithEmail(email, password);
        onAuthSuccess(user.email || email);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect email or password.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await signInWithGoogle();
      onAuthSuccess(res.user.email || 'Google User', res.accessToken);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google sign-in was cancelled or encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BrandLogo size={24} />
            <h3 style={{ fontSize: '1.25rem' }}>
              {mode === 'signin' ? 'Sign in to Storyboard' : 'Create an Account'}
            </h3>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--line)' }}>
          <button
            style={{
              flex: 1,
              padding: '12px',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: mode === 'signin' ? 'var(--accent)' : 'var(--muted)',
              borderBottom: mode === 'signin' ? '2px solid var(--accent)' : 'none',
              background: mode === 'signin' ? 'var(--accent-soft)' : 'transparent',
            }}
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
          >
            Sign In
          </button>
          <button
            style={{
              flex: 1,
              padding: '12px',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: mode === 'signup' ? 'var(--accent)' : 'var(--muted)',
              borderBottom: mode === 'signup' ? '2px solid var(--accent)' : 'none',
              background: mode === 'signup' ? 'var(--accent-soft)' : 'transparent',
            }}
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div
              style={{
                background: 'rgba(163, 67, 43, 0.12)',
                border: '1px solid var(--crit)',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--crit)',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                Your Name / Pen Name
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', color: 'var(--muted)' }} />
                <input
                  type="text"
                  placeholder="Arthur Conan Doyle"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                    padding: '8px 12px 8px 36px',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--muted)' }} />
              <input
                type="email"
                required
                placeholder="writer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '8px 12px 8px 36px',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--muted)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '8px 12px 8px 36px',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="action-btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '6px', padding: '10px' }}
          >
            {mode === 'signin' ? <LogIn size={16} /> : <UserPlus size={16} />}
            <span>{loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '6px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            className="action-btn-secondary"
            onClick={handleGoogleAuth}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
          >
            <svg width="16" height="16" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.5h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.6z" />
              <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.9 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8l3-2.3z" />
              <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6z" />
            </svg>
            <span>Continue with Google & Drive</span>
          </button>
        </form>
      </div>
    </div>
  );
};
