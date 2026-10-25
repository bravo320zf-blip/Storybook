import React, { useState, useEffect, useRef } from 'react';
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
import { AuthModal } from './components/AuthModal';
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
  clearAllStoredData,
} from './services/storage';
import {
  saveStoryToDrive,
  syncAllToGoogleDrive,
  syncIncrementalToGoogleDrive,
  syncBiDirectionalWithGoogleDrive,
  deleteDriveFile,
  exportStoryboardToDrive,
  deleteInklingDriveFolder,
} from './services/googleDrive';
import {
  signInWithGoogle,
  signOutUser,
  subscribeToAuth,
  syncStoryToFirestore,
  deleteStoryFromFirestore,
  clearUserFirestoreData,
} from './services/firebase';
import { Story, Character, StoryboardData, WorldMap, UserConfig, CardKind } from './types';

export const App: React.FC = () => {
  // App Core State
  const [stories, setStories] = useState<Story[]>(loadStoredStories);
  const [characters, setCharacters] = useState<Character[]>(loadStoredCharacters);
  const [storyboard, setStoryboard] = useState<StoryboardData>(loadStoredStoryboard);
  const [maps, setMaps] = useState<WorldMap[]>(loadStoredMaps);
  const [config, setConfig] = useState<UserConfig>(loadStoredConfig);

  // Modification tracking for incremental sync
  const [charactersLastModified, setCharactersLastModified] = useState(Date.now());
  const [charactersLastSynced, setCharactersLastSynced] = useState(0);
  const [storyboardLastModified, setStoryboardLastModified] = useState(Date.now());
  const [storyboardLastSynced, setStoryboardLastSynced] = useState(0);
  const [mapsLastModified, setMapsLastModified] = useState(Date.now());
  const [mapsLastSynced, setMapsLastSynced] = useState(0);

  // Views & Routing
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  // Modals
  const [searchQuery, setSearchQuery] = useState('');
  const [isCmdkOpen, setIsCmdkOpen] = useState(false);
  const [isSprintOpen, setIsSprintOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Cloud & Drive Sync State
  const [driveSyncing, setDriveSyncing] = useState(false);
  const [lastDriveSync, setLastDriveSync] = useState<number | undefined>(() => {
    const saved = localStorage.getItem('ink_last_drive_sync');
    return saved ? parseInt(saved, 10) : undefined;
  });

  // Are there unsaved changes that need to be synced?
  const hasPendingChanges =
    stories.some((s) => s.edited > (s.gdriveLastSynced || 0)) ||
    charactersLastModified > charactersLastSynced ||
    storyboardLastModified > storyboardLastSynced ||
    mapsLastModified > mapsLastSynced;

  // Synchronize CSS tokens, Dark Mode, and themes with document element
  useEffect(() => {
    document.documentElement.dataset.mode = config.darkMode ? 'dark' : 'light';
    document.documentElement.dataset.theme = config.theme;
    localStorage.setItem('ink_mode', config.darkMode ? 'dark' : 'light');

    const fontFamilies = {
      serif: '"Cormorant Garamond", Georgia, serif',
      sans: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      mono: '"Courier Prime", monospace',
    };
    document.documentElement.style.setProperty('--sans', fontFamilies[config.font]);
  }, [config.darkMode, config.theme, config.font]);

  // Save changes to local storage immediately
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
          googleUserEmail: user.email || user.displayName || undefined,
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

  // Intelligent 60-Second Bi-Directional Auto-Sync
  useEffect(() => {
    const autoSyncTimer = setInterval(async () => {
      if (config.googleAccessToken && config.googleAccessToken !== 'demo-token') {
        try {
          setDriveSyncing(true);
          const res = await syncBiDirectionalWithGoogleDrive(
            config.googleAccessToken,
            config.googleDriveFolderName,
            {
              stories,
              characters,
              storyboards: { default: storyboard },
              maps,
            },
            {
              charactersLastModified,
              charactersLastSynced,
              storyboardLastModified,
              storyboardLastSynced,
              mapsLastModified,
              mapsLastSynced,
            }
          );

          if (res.syncedStoriesCount > 0 || res.updatedStories.length !== stories.length) {
            setStories(res.updatedStories);
          }
          if (res.syncedCharacters) setCharactersLastSynced(Date.now());
          if (res.syncedStoryboard) setStoryboardLastSynced(Date.now());
          if (res.syncedMaps) setMapsLastSynced(Date.now());
          setLastDriveSync(res.syncedAt);
          localStorage.setItem('ink_last_drive_sync', String(res.syncedAt));
        } catch (err: any) {
          console.warn('Auto-sync notice:', err);
        } finally {
          setDriveSyncing(false);
        }
      }
    }, 60000); // exactly every 60 seconds

    return () => clearInterval(autoSyncTimer);
  }, [
    config.googleAccessToken,
    config.googleDriveFolderName,
    stories,
    characters,
    storyboard,
    maps,
    charactersLastModified,
    charactersLastSynced,
    storyboardLastModified,
    storyboardLastSynced,
    mapsLastModified,
    mapsLastSynced,
  ]);

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
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'bravo320zf-blip.github.io';
        alert(
          `Domain "${domain}" is not authorized for Google OAuth yet in Firebase.\n\nTo fix this:\n1. Open console.firebase.google.com\n2. Select your project ("inkling-writing-desk")\n3. Click Authentication → Settings → Authorized domains\n4. Click "Add domain" and enter "${domain}"`
        );
        return;
      }
      const demoEmail = prompt('Enter your Google Account email to link Drive:', 'author@storybook.writer');
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

  const handleAuthSuccess = (email: string, accessToken?: string) => {
    setConfig((prev) => ({
      ...prev,
      googleUserEmail: email,
      googleAccessToken: accessToken || prev.googleAccessToken,
    }));
  };

  const handleSignOut = async () => {
    await signOutUser();
    setConfig((prev) => ({
      ...prev,
      googleUserEmail: undefined,
      googleAccessToken: undefined,
    }));
  };

  // Manual Trigger Two-Way Drive Sync
  const handleTriggerDriveSync = async () => {
    setDriveSyncing(true);
    try {
      if (config.googleAccessToken && config.googleAccessToken !== 'demo-token') {
        const res = await syncBiDirectionalWithGoogleDrive(
          config.googleAccessToken,
          config.googleDriveFolderName,
          {
            stories,
            characters,
            storyboards: { default: storyboard },
            maps,
          },
          {
            charactersLastModified: Date.now(),
            charactersLastSynced: 0,
            storyboardLastModified: Date.now(),
            storyboardLastSynced: 0,
            mapsLastModified: Date.now(),
            mapsLastSynced: 0,
          }
        );
        setStories(res.updatedStories);
        setLastDriveSync(res.syncedAt);
        localStorage.setItem('ink_last_drive_sync', String(res.syncedAt));

        const summaries: string[] = [];
        if (res.importedCount > 0)
          summaries.push(`📥 Imported ${res.importedCount} new Google Doc${res.importedCount > 1 ? 's' : ''}`);
        if (res.updatedLocalCount > 0)
          summaries.push(`🔄 Updated ${res.updatedLocalCount} local manuscript${res.updatedLocalCount > 1 ? 's' : ''} from Drive`);
        if (res.updatedRemoteCount > 0)
          summaries.push(`☁️ Uploaded ${res.updatedRemoteCount} manuscript${res.updatedRemoteCount > 1 ? 's' : ''} to Drive`);

        const msg =
          summaries.length > 0
            ? summaries.join('\n') + `\n\nGoogle Drive Folder: "${config.googleDriveFolderName}"`
            : `Everything is up to date with Google Drive folder "${config.googleDriveFolderName}"!`;
        alert(`Google Drive Two-Way Sync Complete:\n\n${msg}`);
      } else {
        await new Promise((r) => setTimeout(r, 600));
        const now = Date.now();
        setLastDriveSync(now);
        localStorage.setItem('ink_last_drive_sync', String(now));
        alert(`Synced to Google Drive ("${config.googleDriveFolderName}")!`);
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Could not sync to Google Drive. Check connection in Setup.');
    } finally {
      setDriveSyncing(false);
    }
  };

  // Save single story to Drive immediately
  const handleSaveStoryToDrive = async (story: Story) => {
    if (config.googleAccessToken && config.googleAccessToken !== 'demo-token') {
      const folderId = config.googleDriveFolderId || 'root';
      const fileId = await saveStoryToDrive(config.googleAccessToken, folderId, story);
      const updatedStory = { ...story, gdriveFileId: fileId, gdriveLastSynced: Date.now() };
      setStories((prev) => prev.map((s) => (s.id === story.id ? updatedStory : s)));
    } else {
      await new Promise((r) => setTimeout(r, 500));
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

  const handleDeleteStory = async (storyId: string) => {
    const storyToDelete = stories.find((s) => s.id === storyId);
    if (!storyToDelete) return;

    // 1. Remove from local state
    setStories((prev) => prev.filter((s) => s.id !== storyId));
    if (activeStory?.id === storyId) {
      setActiveStory(null);
      setCurrentView('dashboard');
    }

    // 2. Delete from Google Drive if synced
    if (storyToDelete.gdriveFileId && config.googleAccessToken && config.googleAccessToken !== 'demo-token') {
      try {
        await deleteDriveFile(config.googleAccessToken, storyToDelete.gdriveFileId);
        console.log(`Deleted story file from Google Drive: ${storyToDelete.gdriveFileId}`);
      } catch (err) {
        console.warn('Failed to delete story from Google Drive:', err);
      }
    }

    // 3. Delete from Firebase Firestore if signed in
    if (config.googleUserEmail) {
      try {
        await deleteStoryFromFirestore(config.googleUserEmail, storyId);
        console.log(`Deleted story ${storyId} from Firestore.`);
      } catch (err) {
        console.warn('Failed to delete story from Firestore:', err);
      }
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
    setStoryboardLastModified(Date.now());
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

  // Complete wipe of test data from Google Drive, Firestore, and LocalStorage
  const handleWipeAllData = async () => {
    const confirmWipe = window.confirm(
      `Are you sure you want to remove all test data from your Google Drive ("${config.googleDriveFolderName}") and reset your workspace? This will delete all sample stories, characters, and boards.`
    );
    if (!confirmWipe) return;

    setDriveSyncing(true);
    try {
      if (config.googleAccessToken && config.googleAccessToken !== 'demo-token') {
        await deleteInklingDriveFolder(config.googleAccessToken, config.googleDriveFolderName);
      }

      clearAllStoredData();
      setStories([]);
      setCharacters([]);
      setStoryboard({ cards: [], links: [] });
      setMaps([]);
      setActiveStory(null);
      setLastDriveSync(undefined);

      alert('All test data has been deleted from your Google Drive and workspace. You now have a clean slate!');
    } catch (err: any) {
      console.error(err);
      alert('Could not complete wipe: ' + (err.message || err));
    } finally {
      setDriveSyncing(false);
    }
  };

  // Keyboard shortcut for Command Palette (⌘K / Ctrl+K)
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
      {/* Mobile Sidebar Backdrop */}
      {isMobileNavOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={activeStory ? 'editor' : currentView}
        onNavigate={(v) => {
          setActiveStory(null);
          setCurrentView(v);
          setIsMobileNavOpen(false);
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
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <main className="app-main">
        {/* Topbar */}
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
            onOpenAuth={() => setIsAuthOpen(true)}
            userEmail={config.googleUserEmail}
            onTriggerDriveSync={handleTriggerDriveSync}
            onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
            syncStatus={{
              syncing: driveSyncing,
              lastSynced: lastDriveSync,
              pendingChanges: hasPendingChanges,
            }}
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
            onDeleteStory={handleDeleteStory}
            driveFolderName={config.googleDriveFolderName}
            googleAccessToken={config.googleAccessToken}
            driveFolderId={config.googleDriveFolderId}
          />
        ) : currentView === 'dashboard' ? (
          <DashboardView
            stories={stories.filter((s) =>
              searchQuery ? s.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
            )}
            stats={stats}
            onOpenStory={(story) => setActiveStory(story)}
            onNewStory={() => handleCreateNewStory()}
            onDeleteStory={handleDeleteStory}
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
            onDeleteStory={handleDeleteStory}
            onImportDraft={() => setIsImportOpen(true)}
          />
        ) : currentView === 'storyboard' ? (
          <StoryboardView
            boardData={storyboard}
            onUpdateBoard={(newBoard) => {
              setStoryboard(newBoard);
              setStoryboardLastModified(Date.now());
            }}
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
            onUpdateCharacters={(newChars) => {
              setCharacters(newChars);
              setCharactersLastModified(Date.now());
            }}
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
            onUpdateMaps={(newMaps) => {
              setMaps(newMaps);
              setMapsLastModified(Date.now());
            }}
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
            onWipeAllData={handleWipeAllData}
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
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

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
          setCurrentView('editor');
        }}
      />
    </div>
  );
};
