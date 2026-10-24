import React, { useState } from 'react';
import {
  Search,
  Command,
  HelpCircle,
  Sun,
  Moon,
  PenTool,
  ChevronDown,
  BookPlus,
  ScrollText,
  Heart,
  UploadCloud,
  Timer,
  User as UserIcon,
  RefreshCw,
  Cloud,
  Check,
} from 'lucide-react';
import { UserConfig } from '../types';

interface TopbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCmdk: () => void;
  onOpenHelp: () => void;
  onOpenSprint: () => void;
  config: UserConfig;
  onToggleDarkMode: () => void;
  onChangeTheme: (theme: UserConfig['theme']) => void;
  onNewStory: () => void;
  onNewProject: () => void;
  onNewPoem: () => void;
  onNewJournal: () => void;
  onImportDraft: () => void;
  onOpenAuth: () => void;
  userEmail?: string;
  syncStatus: {
    syncing: boolean;
    lastSynced?: number;
    pendingChanges: boolean;
  };
}

export const Topbar: React.FC<TopbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenCmdk,
  onOpenHelp,
  onOpenSprint,
  config,
  onToggleDarkMode,
  onChangeTheme,
  onNewStory,
  onNewProject,
  onNewPoem,
  onNewJournal,
  onImportDraft,
  onOpenAuth,
  userEmail,
  syncStatus,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar">
      {/* Search Bar */}
      <div className="search-box">
        <Search size={15} style={{ color: 'var(--muted)' }} />
        <input
          type="text"
          placeholder="Search your stories…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Command Palette trigger */}
      <button
        className="icon-btn"
        onClick={onOpenCmdk}
        title="Command palette (⌘K / Ctrl+K)"
        style={{ width: 'auto', padding: '0 10px', gap: '6px', fontSize: '0.8rem', border: '1px solid var(--line)' }}
      >
        <Command size={13} />
        <span>⌘K</span>
      </button>

      {/* Sprint Timer quick trigger */}
      <button
        className="icon-btn"
        onClick={onOpenSprint}
        title="Start writing sprint"
        style={{ width: 'auto', padding: '0 10px', gap: '6px', fontSize: '0.8rem', border: '1px solid var(--line)' }}
      >
        <Timer size={14} style={{ color: 'var(--accent)' }} />
        <span>Sprint</span>
      </button>

      {/* Incremental Auto-Sync Indicator (Syncs every minute) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          padding: '4px 10px',
          borderRadius: '16px',
          background: 'var(--bg)',
          border: '1px solid var(--line)',
          color: 'var(--muted)',
        }}
        title={
          syncStatus.syncing
            ? 'Syncing changes to Google Drive and Firebase...'
            : syncStatus.pendingChanges
            ? 'Changes pending (Auto-syncs every 60s)'
            : 'All changes synced to cloud'
        }
      >
        {syncStatus.syncing ? (
          <>
            <RefreshCw size={12} className="animate-spin text-warn" />
            <span>Syncing…</span>
          </>
        ) : syncStatus.pendingChanges ? (
          <>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--warn)' }} />
            <span>Pending sync</span>
          </>
        ) : (
          <>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--good)' }} />
            <span>Synced</span>
          </>
        )}
      </div>

      {/* Help Tips */}
      <button className="icon-btn" onClick={onOpenHelp} title="Tips & features guide">
        <HelpCircle size={16} />
      </button>

      <div style={{ flex: 1 }} />

      {/* Dark / Light Mode Switch */}
      <button
        className="icon-btn"
        onClick={onToggleDarkMode}
        style={{
          background: config.darkMode ? 'var(--accent-soft)' : 'transparent',
          border: '1px solid var(--line)',
        }}
        title={config.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {config.darkMode ? (
          <Sun size={17} style={{ color: '#FDB813' }} />
        ) : (
          <Moon size={17} style={{ color: 'var(--ink)' }} />
        )}
      </button>

      {/* Theme selection */}
      <select
        value={config.theme}
        onChange={(e) => onChangeTheme(e.target.value as UserConfig['theme'])}
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--line)',
          borderRadius: '6px',
          padding: '4px 8px',
          fontSize: '0.82rem',
          outline: 'none',
        }}
        title="Palette theme"
      >
        <option value="clay">Clay (Warm)</option>
        <option value="parchment">Parchment</option>
        <option value="slate">Slate</option>
        <option value="forest">Forest</option>
      </select>

      {/* User Account / Sign In Pill */}
      {userEmail ? (
        <button
          className="action-btn-secondary"
          onClick={onOpenAuth}
          style={{ padding: '4px 10px', fontSize: '0.8rem', gap: '6px' }}
          title={`Account: ${userEmail}`}
        >
          <UserIcon size={13} style={{ color: 'var(--accent)' }} />
          <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userEmail.split('@')[0]}
          </span>
        </button>
      ) : (
        <button
          className="action-btn-secondary"
          onClick={onOpenAuth}
          style={{ padding: '4px 10px', fontSize: '0.8rem', gap: '6px' }}
        >
          <UserIcon size={13} />
          <span>Sign In</span>
        </button>
      )}

      {/* New Story split button */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <button
          className="action-btn-primary"
          onClick={onNewStory}
          style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
        >
          <PenTool size={14} />
          <span>New story</span>
        </button>

        <button
          className="action-btn-primary"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderLeft: '1px solid rgba(255,255,255,0.25)',
            padding: '8px 8px',
          }}
          title="More ways to create"
        >
          <ChevronDown size={14} />
        </button>

        {menuOpen && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 50 }}
              onClick={() => setMenuOpen(false)}
            />
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '180px',
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow)',
                zIndex: 60,
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <button
                className="nav-item"
                style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                onClick={() => {
                  setMenuOpen(false);
                  onNewProject();
                }}
              >
                <BookPlus size={15} />
                <span>New project</span>
              </button>
              <button
                className="nav-item"
                style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                onClick={() => {
                  setMenuOpen(false);
                  onNewPoem();
                }}
              >
                <ScrollText size={15} />
                <span>New poem</span>
              </button>
              <button
                className="nav-item"
                style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                onClick={() => {
                  setMenuOpen(false);
                  onNewJournal();
                }}
              >
                <Heart size={15} />
                <span>Journal entry</span>
              </button>
              <button
                className="nav-item"
                style={{ fontSize: '0.85rem', padding: '6px 10px', borderTop: '1px solid var(--line)' }}
                onClick={() => {
                  setMenuOpen(false);
                  onImportDraft();
                }}
              >
                <UploadCloud size={15} />
                <span>Import draft</span>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
