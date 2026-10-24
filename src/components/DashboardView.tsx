import React, { useState } from 'react';
import { ArrowRight, Flame, Cloud, RefreshCw, FolderSync } from 'lucide-react';
import { Story, StoryStatus, WritingStats } from '../types';
import { StoryCoverSvg } from '../utils/coverGenerator';

interface DashboardViewProps {
  stories: Story[];
  stats: WritingStats;
  onOpenStory: (story: Story) => void;
  onNewStory: () => void;
  driveSyncStatus: {
    folderName: string;
    syncing: boolean;
    lastSynced?: number;
  };
  onTriggerDriveSync: () => void;
}

const CHIPS: { id: 'all' | StoryStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'drafting', label: 'Drafting' },
  { id: 'stuck', label: 'Stuck' },
  { id: 'needs-ending', label: 'Needs ending' },
  { id: 'resting', label: 'Resting' },
  { id: 'finished', label: 'Finished' },
];

function formatTimeAgo(timestamp: number): string {
  const diffDays = Math.floor((Date.now() - timestamp) / (86400 * 1000));
  if (diffDays <= 0) return 'edited today';
  if (diffDays === 1) return 'edited yesterday';
  if (diffDays < 14) return `edited ${diffDays} days ago`;
  if (diffDays < 60) return `edited ${Math.round(diffDays / 7)} weeks ago`;
  return `edited ${Math.round(diffDays / 30)} months ago`;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stories,
  stats,
  onOpenStory,
  driveSyncStatus,
  onTriggerDriveSync,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | StoryStatus>('all');

  const filteredStories = stories.filter((s) => {
    if (selectedFilter === 'all') return true;
    return s.status === selectedFilter;
  });

  return (
    <div className="page-content">
      {/* Header text */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', fontWeight: 600, color: 'var(--ink)' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>
          Every story, and exactly where you left it.
        </p>
      </div>

      {/* Writing Stats Banner */}
      <div className="stats-banner">
        <div className="stat-item">
          <span className="stat-num">{stats.totalStories}</span>
          <span className="stat-label">Stories</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">
            {stats.totalWords > 1000
              ? `${(stats.totalWords / 1000).toFixed(1)}k`
              : stats.totalWords}
          </span>
          <span className="stat-label">Words written</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">{stats.wordsThisWeek}</span>
          <span className="stat-label">This week</span>
        </div>
        <div className="stat-item">
          <span className="stat-num" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {stats.streakDays} <Flame size={18} style={{ color: '#E25822' }} />
          </span>
          <span className="stat-label">Days streak</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">{stats.totalIdeas}</span>
          <span className="stat-label">Ideas & sparks</span>
        </div>
      </div>

      {/* Google Drive Status Bar */}
      <div className="drive-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Cloud size={20} style={{ color: '#4285F4' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ink)' }}>
              Google Drive Storage: <span style={{ color: 'var(--accent)' }}>{driveSyncStatus.folderName}</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
              All manuscripts, chapters, character dossiers, and boards are synced directly into your Google Drive.
            </div>
          </div>
        </div>
        <button
          className="action-btn-secondary"
          onClick={onTriggerDriveSync}
          disabled={driveSyncStatus.syncing}
        >
          {driveSyncStatus.syncing ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <FolderSync size={14} />
          )}
          <span>{driveSyncStatus.syncing ? 'Syncing...' : 'Sync to Google Drive'}</span>
        </button>
      </div>

      {/* Status Filter Chips */}
      <div className="chips-row">
        {CHIPS.map((chip) => {
          const count =
            chip.id === 'all'
              ? stories.length
              : stories.filter((s) => s.status === chip.id).length;
          return (
            <button
              key={chip.id}
              className={`chip ${selectedFilter === chip.id ? 'active' : ''}`}
              onClick={() => setSelectedFilter(chip.id)}
            >
              {chip.label} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Stories Grid */}
      <div className="stories-grid">
        {filteredStories.map((story, idx) => {
          const palettes: ('clay' | 'gold' | 'night' | 'forest' | 'rose' | 'ocean')[] = [
            'clay',
            'gold',
            'forest',
            'night',
            'rose',
            'ocean',
          ];
          const palette = palettes[idx % palettes.length];

          return (
            <div key={story.id} className="story-card">
              {/* Procedural Landscape Cover */}
              <div className="story-cover-area">
                <StoryCoverSvg seed={story.title + story.id} palette={palette} />
                <span className={`status-badge ${story.status}`}>{story.status}</span>
              </div>

              {/* Story Details */}
              <div className="story-details">
                <h3 className="story-title">{story.title}</h3>

                <p className="story-previously">
                  <em>Previously…</em> {story.summary || 'A blank canvas waiting for your words.'}
                </p>

                <div className="story-meta-row">
                  <span>
                    {(story.words || 0).toLocaleString()} words · {formatTimeAgo(story.edited)}
                  </span>
                  <button
                    className="jump-in-btn"
                    onClick={() => onOpenStory(story)}
                  >
                    <span>Jump back in</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
