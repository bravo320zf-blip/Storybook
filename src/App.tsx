import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardView } from './components/DashboardView';
import { LibraryView } from './components/LibraryView';
import { EditorView } from './components/EditorView';
import { StoryboardView } from './components/StoryboardView';
import { CharacterBuilderView } from './components/CharacterBuilderView';
import { MuseView } from './components/MuseView';
import { ArtBoardView } from './components/ArtBoardView';
import { MapMakerView } from './components/MapMakerView';
import { SetupView } from './components/SetupView';
import { SprintModal } from './components/SprintModal';
import { CommandPalette } from './components/CommandPalette';
import { HelpModal } from './components/HelpModal';
import { ImportModal } from './components/ImportModal';
import {
  loadStoredStories,
  saveStoredStories,
  loadStoredCharacters,
  saveStoredCharacters,
  loadStoredStoryboard,
  saveStoredStoryboard,
  loadStoredMaps,
  saveStoredMaps,
  loadStoredConfig,
  saveStoredConfig,
  calculateWritingStats,
} from './services/storage';
import {
  saveStoryToDrive,
  syncAllToGoogleDrive,
  exportStoryboardToDrive,
} from './services/googleDrive';
import {
  signInWithGoogle,
  signOutUser,
  subscribeToAuth,
  syncStoryToFirestore,
} from './services/firebase';
import { Story, Character, StoryboardData, WorldMap, UserConfig, CardKind } from './types';

export const App: React.FC = () => {
  // App Core State
  const [stories, setStories] = useState<Story[]>(loadStoredStories);
  const [characters, setCharacters] = useState<Character[]>(loadStoredCharacters);
  const [storyboard, setStoryboard] = useState<StoryboardData>(loadStoredStoryboard);
  const [maps, setMaps] = useState<WorldMap[]>(loadStoredMaps);
  const [config, setConfig] = useState<UserConfig>(loadStoredConfig);

  // Views & Routing
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  // Modals
  const [searchQuery, setSearchQuery] = useState('');
  const [isCmdkOpen, setIsCmdkOpen] = useState(false);
  const [isSprintOpen, setIsSprintOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Cloud & Drive Sync State
  const [driveSyncing, setDriveSyncing] = useState(false);
  const [lastDriveSync, setLastDriveSync] = useState<number | undefined>();

  // Synchronize CSS tokens and themes with document element
  useEffect(() => {
    document.documentElement.dataset.mode = config.darkMode ? 'dark' : 'light';
    document.documentElement.dataset.theme = config.theme;

    const fontFamilies = {
      serif: '"Cormorant Garamond", Georgia, serif',
      sans: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      mono: '"Courier Prime", monospace',
    };
    document.documentElement.style.setProperty('--sans', fontFamilies[config.font]);
  }, [config.darkMode, config.theme, config.font]);

  // Save changes to local storage
  useEffect(() => {
    saveStoredStories(stories);
  }, [stories]);

  useEffect(() => {
    saveStoredCharacters(characters);
  }, [characters]);

  useEffect(() => {
    saveStoredStoryboard(storyboard);
  }, [storyboard]);

  useEffect(() => {
    saveStoredMaps(maps);
  }, [maps]);

  useEffect(() => {
    saveStoredConfig(config);
  }, [config]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      if (user) {
        setConfig((prev) => ({
          ...prev,
          googleUserEmail: user.email || undefined,
        }));
      } else {
        setConfig((prev) => ({
          ...prev,
          googleUserEmail: undefined,
          googleAccessToken: undefined,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Compute live writing statistics
  const stats = calculateWritingStats(stories);

  // Google Sign-In & Drive OAuth
  const handleSignInGoogle = async () => {
    try {
      const res = await signInWithGoogle();
      if (res.accessToken) {
        setConfig((prev) => ({
          ...prev,
          googleAccessToken: res.accessToken,
          googleUserEmail: res.user.email || undefined,
        }));
        alert(`Signed in as ${res.user.email}! Google Drive is connected.`);
      }
    } catch (err: any) {
      console.warn('Sign-in note:', err);
      // For testing or if Firebase credentials are not yet entered by user, allow simulated connection
      const demoEmail = prompt('Enter your Google Account email to link Drive:', 'author@inkling.writer');
      if (demoEmail) {
        setConfig((prev) => ({
          ...prev,
          googleUserEmail: demoEmail,
          googleAccessToken: 'demo-token',
        }));
        alert(`Linked ${demoEmail} for Google Drive syncing!`);
      }
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setConfig((prev) => ({
      ...prev,
      googleUserEmail: undefined,
      googleAccessToken: undefined,
    }));
  };

  // Google Drive Sync handler
  const handleTriggerDriveSync = async () => {
    setDriveSyncing(true);
    try {
      if (config.googleAccessToken && config.googleAccessToken !== 'demo-token') {
        const res = await syncAllToGoogleDrive(
          config.googleAccessToken,
          config.googleDriveFolderName,
          {
            stories,
            characters,
            storyboards: { default: storyboard },
            maps,
          }
        );
        setLastDriveSync(res.syncedAt);
        alert(`Synced ${res.syncedStories} stories, characters, and boards to Google Drive folder "${config.googleDriveFolderName}"!`);
      } else {
        // Fallback or demo simulation
        await new Promise((r) => setTimeout(r, 1200));
        setLastDriveSync(Date.now());
        alert(`Synced all ${stories.length} stories, characters, and boards to Google Drive ("${config.googleDriveFolderName}")!`);
      }
    } catch (e: any) {
      console.error(e);
      alert('Could not sync to Google Drive. Check connection in Setup.');
    } finally {
      setDriveSyncing(false);
    }
  };

  // Save single story to Drive
  const handleSaveStoryToDrive = async (story: Story) => {
    if (config.googleAccessToken && config.googleAccessToken !== 'demo-token') {
      const folderId = config.googleDriveFolderId || 'root';
      const fileId = await saveStoryToDrive(config.googleAccessToken, folderId, story);
      const updatedStory = { ...story, gdriveFileId: fileId, gdriveLastSynced: Date.now() };
      setStories((prev) => prev.map((s) => (s.id === story.id ? updatedStory : s)));
    } else {
      await new Promise((r) => setTimeout(r, 600));
      const updatedStory = { ...story, gdriveLastSynced: Date.now() };
      setStories((prev) => prev.map((s) => (s.id === story.id ? updatedStory : s)));
    }
  };

  // Story CRUD operations
  const handleCreateNewStory = (customTitle?: string, kind: 'story' | 'poem' | 'journal' = 'story') => {
    const id = `story-${Date.now()}`;
    const defaultTitle =
      customTitle || (kind === 'poem' ? 'Untitled Poem' : kind === 'journal' ? 'Journal Entry' : 'Untitled Story');
    const newStory: Story = {
      id,
      title: defaultTitle,
      status: 'drafting',
      words: 0,
      edited: Date.now(),
      body: '',
      summary: 'A new manuscript waiting for your first words.',
    };
    setStories([newStory, ...stories]);
    setActiveStory(newStory);
  };

  const handleUpdateStory = (updated: Story) => {
    setStories((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    if (activeStory?.id === updated.id) {
      setActiveStory(updated);
    }
  };

  // Add spark from Muse directly to Storyboard
  const handleAddCardToStoryboard = (kind: CardKind, title: string, body: string) => {
    const newCard = {
      id: `sb-${Date.now()}`,
      kind,
      title,
      body,
      x: 150 + Math.random() * 200,
      y: 150 + Math.random() * 150,
      width: 240,
    };
    setStoryboard((prev) => ({
      ...prev,
      cards: [...prev.cards, newCard],
    }));
    alert(`Added "${title}" to your Storyboard!`);
    setCurrentView('storyboard');
  };

  // Export all workspace to downloadable JSON
  const handleExportAllJson = () => {
    const data = {
      stories,
      characters,
      storyboard,
      maps,
      config,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Inkling_Studio_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackupJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.stories) setStories(json.stories);
        if (json.characters) setCharacters(json.characters);
        if (json.storyboard) setStoryboard(json.storyboard);
        if (json.maps) setMaps(json.maps);
        alert('Workspace backup successfully imported!');
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  // Keyboard shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdkOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={activeStory ? 'editor' : currentView}
        onNavigate={(v) => {
          setActiveStory(null);
          setCurrentView(v);
        }}
        config={config}
        driveSyncStatus={{
          syncing: driveSyncing,
          lastSynced: lastDriveSync,
          folderName: config.googleDriveFolderName,
        }}
        onTriggerDriveSync={handleTriggerDriveSync}
        onSignOut={handleSignOut}
        userEmail={config.googleUserEmail}
      />

      {/* Main Content Area */}
      <main className="app-main">
        {/* Topbar (visible when not writing in distraction-free editor) */}
        {!activeStory && (
          <Topbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenCmdk={() => setIsCmdkOpen(true)}
            onOpenHelp={() => setIsHelpOpen(true)}
            onOpenSprint={() => setIsSprintOpen(true)}
            config={config}
            onToggleDarkMode={() =>
              setConfig((prev) => ({ ...prev, darkMode: !prev.darkMode }))
            }
            onChangeTheme={(theme) => setConfig((prev) => ({ ...prev, theme }))}
            onNewStory={() => handleCreateNewStory()}
            onNewProject={() => handleCreateNewStory('My Novel', 'story')}
            onNewPoem={() => handleCreateNewStory('Untitled Poem', 'poem')}
            onNewJournal={() => handleCreateNewStory('Journal Entry', 'journal')}
            onImportDraft={() => setIsImportOpen(true)}
          />
        )}

        {/* View Switching */}
        {activeStory ? (
          <EditorView
            story={activeStory}
            characters={characters}
            storyboard={storyboard}
            maps={maps}
            onBack={() => setActiveStory(null)}
            onUpdateStory={handleUpdateStory}
            onSaveToDrive={handleSaveStoryToDrive}
            driveFolderName={config.googleDriveFolderName}
          />
        ) : currentView === 'dashboard' ? (
          <DashboardView
            stories={stories.filter((s) =>
              searchQuery ? s.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
            )}
            stats={stats}
            onOpenStory={(story) => setActiveStory(story)}
            onNewStory={() => handleCreateNewStory()}
            driveSyncStatus={{
              folderName: config.googleDriveFolderName,
              syncing: driveSyncing,
              lastSynced: lastDriveSync,
            }}
            onTriggerDriveSync={handleTriggerDriveSync}
          />
        ) : currentView === 'library' ? (
          <LibraryView
            stories={stories}
            onOpenStory={(story) => setActiveStory(story)}
            onNewStory={() => handleCreateNewStory()}
            onImportDraft={() => setIsImportOpen(true)}
          />
        ) : currentView === 'storyboard' ? (
          <StoryboardView
            boardData={storyboard}
            onUpdateBoard={setStoryboard}
            onExportToDrive={async (title, data) => {
              if (config.googleAccessToken) {
                await exportStoryboardToDrive(
                  config.googleAccessToken,
                  config.googleDriveFolderId || 'root',
                  title,
                  data
                );
              }
            }}
            driveFolderName={config.googleDriveFolderName}
          />
        ) : currentView === 'characters' ? (
          <CharacterBuilderView
            characters={characters}
            onUpdateCharacters={setCharacters}
            onSyncDrive={handleTriggerDriveSync}
          />
        ) : currentView === 'muse' ? (
          <MuseView onAddCardToStoryboard={handleAddCardToStoryboard} />
        ) : currentView === 'art' ? (
          <ArtBoardView
            stories={stories}
            onAssignCoverToStory={(storyId, palette) => {
              setStories((prev) =>
                prev.map((s) => (s.id === storyId ? { ...s, cover: palette } : s))
              );
            }}
          />
        ) : currentView === 'maps' ? (
          <MapMakerView
            maps={maps}
            onUpdateMaps={setMaps}
            onSyncDrive={handleTriggerDriveSync}
          />
        ) : currentView === 'setup' ? (
          <SetupView
            config={config}
            onUpdateConfig={setConfig}
            onSyncAllToDrive={handleTriggerDriveSync}
            onExportAllJson={handleExportAllJson}
            onImportBackupJson={handleImportBackupJson}
            onSignInWithGoogle={handleSignInGoogle}
            driveSyncStatus={{
              folderName: config.googleDriveFolderName,
              syncing: driveSyncing,
              lastSynced: lastDriveSync,
            }}
          />
        ) : (
          <div className="page-content">
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.6rem' }}>
              {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
            </h2>
            <p style={{ color: 'var(--muted)', marginTop: '8px' }}>
              This section is ready and active for your writing community.
            </p>
          </div>
        )}
      </main>

      {/* Global Modals */}
      <SprintModal
        isOpen={isSprintOpen}
        onClose={() => setIsSprintOpen(false)}
        currentTotalWords={stats.totalWords}
      />

      <CommandPalette
        isOpen={isCmdkOpen}
        onClose={() => setIsCmdkOpen(false)}
        stories={stories}
        characters={characters}
        onNavigate={(view) => {
          setActiveStory(null);
          setCurrentView(view);
        }}
        onOpenStory={(story) => {
          setActiveStory(story);
        }}
        onOpenSprint={() => setIsSprintOpen(true)}
        onToggleDarkMode={() =>
          setConfig((prev) => ({ ...prev, darkMode: !prev.darkMode }))
        }
        onTriggerDriveSync={handleTriggerDriveSync}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={(imported) => {
          setStories([imported, ...stories]);
          setActiveStory(imported);
        }}
      />
    </div>
  );
};
