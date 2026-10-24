import { Story, Character, StoryboardData, WorldMap, WritingStats, UserConfig } from '../types';

export const DEFAULT_STORIES: Story[] = [];

export const DEFAULT_CHARACTERS: Character[] = [];

export const DEFAULT_STORYBOARD: StoryboardData = {
  cards: [],
  links: [],
};

export const DEFAULT_MAP: WorldMap = {
  id: 'map-1',
  name: 'My World Map',
  kind: 'realm',
  style: 'wash',
  aspect: 'screen',
  stamps: [],
  realms: [],
  updatedAt: Date.now(),
};

export const DEFAULT_CONFIG: UserConfig = {
  theme: 'clay',
  font: 'serif',
  darkMode: false,
  googleDriveFolderName: 'Inkling Stories',
  autoSyncDrive: true,
};

// Storage keys
const STORAGE_KEYS = {
  STORIES: 'ink_stories',
  CHARACTERS: 'ink_characters',
  STORYBOARD: 'ink_storyboard',
  MAPS: 'ink_maps',
  STATS: 'ink_stats',
  CONFIG: 'ink_config',
  SPRINT: 'ink_sprint',
  GOALS: 'ink_goals',
};

export function loadStoredStories(): Story[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STORIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_STORIES;
}

export function saveStoredStories(stories: Story[]) {
  localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
}

export function loadStoredCharacters(): Character[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHARACTERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_CHARACTERS;
}

export function saveStoredCharacters(characters: Character[]) {
  localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters));
}

export function loadStoredStoryboard(): StoryboardData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STORYBOARD);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_STORYBOARD;
}

export function saveStoredStoryboard(board: StoryboardData) {
  localStorage.setItem(STORAGE_KEYS.STORYBOARD, JSON.stringify(board));
}

export function loadStoredMaps(): WorldMap[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MAPS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [DEFAULT_MAP];
}

export function saveStoredMaps(maps: WorldMap[]) {
  localStorage.setItem(STORAGE_KEYS.MAPS, JSON.stringify(maps));
}

export function loadStoredConfig(): UserConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_CONFIG;
}

export function saveStoredConfig(cfg: UserConfig) {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(cfg));
}

export function calculateWritingStats(stories: Story[]): WritingStats {
  const totalWords = stories.reduce((sum, s) => sum + (s.words || 0), 0);
  const totalStories = stories.length;
  const totalIdeas = stories.filter((s) => s.status === 'stuck' || s.words < 200).length + 3;

  // Compute streak and words this week
  const wordsThisWeek = stories.reduce((acc, s) => {
    const isThisWeek = Date.now() - s.edited < 7 * 86400 * 1000;
    return isThisWeek ? acc + (s.words || 0) : acc;
  }, 0);

  return {
    totalWords,
    wordsThisWeek,
    streakDays: 0,
    totalStories,
    totalIdeas,
    history: {},
  };
}

export function clearAllStoredData() {
  localStorage.removeItem(STORAGE_KEYS.STORIES);
  localStorage.removeItem(STORAGE_KEYS.CHARACTERS);
  localStorage.removeItem(STORAGE_KEYS.STORYBOARD);
  localStorage.removeItem(STORAGE_KEYS.MAPS);
  localStorage.removeItem(STORAGE_KEYS.STATS);
  localStorage.removeItem(STORAGE_KEYS.SPRINT);
  localStorage.removeItem('ink_drive_folder_id_Inkling Stories');
}
