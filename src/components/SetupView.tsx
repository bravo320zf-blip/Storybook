import React, { useState } from 'react';
import {
  Cloud,
  FolderSync,
  Database,
  Palette,
  Type,
  Download,
  Upload,
  Check,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { UserConfig } from '../types';

interface SetupViewProps {
  config: UserConfig;
  onUpdateConfig: (newConfig: UserConfig) => void;
  onSyncAllToDrive: () => Promise<void>;
  onExportAllJson: () => void;
  onImportBackupJson: (file: File) => void;
  onSignInWithGoogle: () => Promise<void>;
  driveSyncStatus: {
    folderName: string;
    syncing: boolean;
    lastSynced?: number;
  };
}

export const SetupView: React.FC<SetupViewProps> = ({
  config,
  onUpdateConfig,
  onSyncAllToDrive,
  onExportAllJson,
  onImportBackupJson,
  onSignInWithGoogle,
  driveSyncStatus,
}) => {
  const [folderName, setFolderName] = useState(config.googleDriveFolderName || 'Inkling Stories');
  const [firebaseApiKey, setFirebaseApiKey] = useState(config.firebaseApiKey || '');
  const [firebaseProjectId, setFirebaseProjectId] = useState(config.firebaseProjectId || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = () => {
    onUpdateConfig({
      ...config,
      googleDriveFolderName: folderName,
      firebaseApiKey,
      firebaseProjectId,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFullDriveSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncAllToDrive();
      alert(`Full workspace successfully synced to Google Drive folder: "${folderName}"!`);
    } catch (e) {
      alert('Failed to sync to Google Drive. Ensure you have authorized Google Drive.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="page-content" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', fontWeight: 600, color: 'var(--ink)' }}>
          Setup & Cloud Connections
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          Configure your Google Drive storage folder, Firebase backend, and writing typography.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Google Drive Card */}
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(66, 133, 244, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4285F4',
              }}
            >
              <Cloud size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)' }}>
                Google Drive Storage
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--muted)' }}>
                All your pages, manuscripts, and world notes stay in your personal Google Drive account.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Google Account authorization button */}
            <div
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                  {config.googleUserEmail ? `Connected: ${config.googleUserEmail}` : 'Google Account Connection'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                  Uses Google Drive API (drive.file scope) for private folder creation and file management.
                </div>
              </div>

              <button className="action-btn-primary" onClick={onSignInWithGoogle}>
                <ShieldCheck size={16} />
                <span>{config.googleUserEmail ? 'Reconnect Account' : 'Connect with Google'}</span>
              </button>
            </div>

            {/* Folder Name */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                Target Folder Name in Google Drive
              </label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  fontSize: '0.9rem',
                }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>
                Inkling creates this folder automatically in your Google Drive root and saves all chapters, characters, and boards inside.
              </p>
            </div>

            {/* Sync all button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="action-btn-secondary"
                onClick={handleFullDriveSync}
                disabled={isSyncing}
              >
                {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <FolderSync size={14} />}
                <span>{isSyncing ? 'Syncing Full Workspace…' : 'Sync Full Workspace to Drive'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Firebase Backend Card */}
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(255, 150, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFA000',
              }}
            >
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)' }}>
                Firebase Backend
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--muted)' }}>
                Provides authentication and lightning-fast cloud sync for your workspace metadata.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                Firebase API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={firebaseApiKey}
                onChange={(e) => setFirebaseApiKey(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                Firebase Project ID
              </label>
              <input
                type="text"
                placeholder="my-inkling-project"
                value={firebaseProjectId}
                onChange={(e) => setFirebaseProjectId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '8px' }}>
            You can configure these here or in your <code>.env</code> file (<code>VITE_FIREBASE_API_KEY</code>, <code>VITE_FIREBASE_PROJECT_ID</code>).
          </p>
        </div>

        {/* Appearance & Typography */}
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Palette size={20} style={{ color: 'var(--accent)' }} />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)' }}>
                Appearance & Typography
              </h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                Color Palette Theme
              </label>
              <select
                value={config.theme}
                onChange={(e) =>
                  onUpdateConfig({ ...config, theme: e.target.value as UserConfig['theme'] })
                }
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.88rem',
                }}
              >
                <option value="clay">Clay (Warm Sand & Neutral)</option>
                <option value="parchment">Parchment (Antique Book Cream)</option>
                <option value="slate">Slate (Cool Mist)</option>
                <option value="forest">Forest (Sage & Moss)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                Editor Font
              </label>
              <select
                value={config.font}
                onChange={(e) =>
                  onUpdateConfig({ ...config, font: e.target.value as UserConfig['font'] })
                }
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.88rem',
                }}
              >
                <option value="serif">Cormorant Garamond (Literary Serif)</option>
                <option value="sans">Plus Jakarta Sans (Modern Clean)</option>
                <option value="mono">Courier Prime (Typewriter Monospace)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save & Export Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="action-btn-secondary" onClick={onExportAllJson}>
              <Download size={15} />
              <span>Export Full Workspace (.json)</span>
            </button>
            <label className="action-btn-secondary" style={{ cursor: 'pointer' }}>
              <Upload size={15} />
              <span>Import Backup</span>
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onImportBackupJson(file);
                }}
              />
            </label>
          </div>

          <button className="action-btn-primary" onClick={handleSaveSettings}>
            {savedSuccess ? <Check size={16} /> : <Check size={16} />}
            <span>{savedSuccess ? 'Settings Saved!' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
