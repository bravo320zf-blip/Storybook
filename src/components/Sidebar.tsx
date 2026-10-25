import React from 'react';
import { BrandLogo } from './BrandLogo';
import {
  BookOpen,
  Library,
  Mail,
  Sparkles,
  LayoutGrid,
  Users,
  Palette,
  Compass,
  MessageSquare,
  Send,
  Heart,
  Settings,
  Cloud,
  CheckCircle2,
  RefreshCw,
  LogOut,
  FolderSync,
  X,
} from 'lucide-react';
import { UserConfig } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  config: UserConfig;
  driveSyncStatus: {
    syncing: boolean;
    lastSynced?: number;
    folderName: string;
  };
  onTriggerDriveSync: () => void;
  onSignOut?: () => void;
  userEmail?: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  tint?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  driveSyncStatus,
  onTriggerDriveSync,
  onSignOut,
  userEmail,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navSections: NavGroup[] = [
    {
      label: 'Write',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
        { id: 'library', label: 'Library', icon: Library },
        { id: 'substack', label: 'My Substack', icon: Mail },
      ],
    },
    {
      label: 'Studio',
      items: [
        { id: 'muse', label: 'Muse', icon: Sparkles, tint: '#BA7517' },
        { id: 'storyboard', label: 'Storyboard', icon: LayoutGrid, tint: '#8a5cc0' },
        { id: 'characters', label: 'Characters', icon: Users, tint: '#B0567A' },
        { id: 'art', label: 'Art board', icon: Palette, tint: '#1D9E75' },
        { id: 'maps', label: 'Map maker', icon: Compass, tint: '#3E7A8C' },
      ],
    },
    {
      label: 'Share',
      items: [
        { id: 'review', label: 'Peer review', icon: MessageSquare },
        { id: 'submissions', label: 'Submissions', icon: Send },
        { id: 'feedback', label: 'Dear Storyboard', icon: Heart },
      ],
    },
  ];

  return (
    <aside className={`app-sidebar ${isOpenMobile ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="brand-header">
        <BrandLogo size={28} />
        <span className="brand-title">Storyboard</span>
        {onCloseMobile && (
          <button
            className="icon-btn mobile-close-sidebar-btn"
            onClick={onCloseMobile}
            title="Close navigation"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="nav-body">
        {navSections.map((group) => (
          <div key={group.label} className="nav-group">
            <div className="nav-group-title">{group.label}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile?.();
                  }}
                >
                  <span
                    className="nav-icon"
                    style={item.tint && !isActive ? { color: item.tint } : undefined}
                  >
                    <Icon size={17} />
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer & Sync Info */}
      <div className="sidebar-footer">
        {/* Google Drive Sync status banner */}
        <div
          className="sync-status-badge"
          title={`Google Drive folder: ${driveSyncStatus.folderName}`}
        >
          {driveSyncStatus.syncing ? (
            <RefreshCw size={13} className="animate-spin text-warn" />
          ) : (
            <span className="sync-dot" />
          )}
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {driveSyncStatus.syncing
              ? 'Syncing to Drive…'
              : `Drive: ${driveSyncStatus.folderName}`}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTriggerDriveSync();
            }}
            title="Sync all to Google Drive"
            style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center' }}
          >
            <FolderSync size={13} />
          </button>
        </div>

        {/* User Account / Sign In */}
        {userEmail ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
              {userEmail}
            </span>
            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Sign out"
                style={{ color: 'var(--muted)', padding: '2px' }}
              >
                <LogOut size={13} />
              </button>
            )}
          </div>
        ) : null}

        <button
          className={`nav-item ${currentView === 'setup' ? 'active' : ''}`}
          onClick={() => {
            onNavigate('setup');
            onCloseMobile?.();
          }}
        >
          <span className="nav-icon">
            <Settings size={16} />
          </span>
          <span>Setup & Drive</span>
        </button>
      </div>
    </aside>
  );
};
