import { Story, Character, StoryboardData, WorldMap, WritingStats, UserConfig } from '../types';

export const DEFAULT_STORIES: Story[] = [];

export const DEFAULT_CHARACTERS: Character[] = [];

export const DEFAULT_STORYBOARDS: StoryboardData[] = [
  {
    id: 'sb-default',
    title: 'Main Storyboard',
    description: 'Master plot threads, beats, and scene cards',
    cards: [],
    links: [],
    updatedAt: Date.now(),
  },
];

export const DEFAULT_STORYBOARD: StoryboardData = DEFAULT_STORYBOARDS[0];

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
  STORYBOARDS: 'ink_storyboards',
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

export function loadStoredStoryboards(): StoryboardData[] {
  try {
    const rawMulti = localStorage.getItem(STORAGE_KEYS.STORYBOARDS);
    if (rawMulti) {
      const parsed = JSON.parse(rawMulti);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // Migration: check old single storyboard
    const rawSingle = localStorage.getItem(STORAGE_KEYS.STORYBOARD);
    if (rawSingle) {
      const parsedSingle = JSON.parse(rawSingle);
      if (parsedSingle && (parsedSingle.cards || parsedSingle.links)) {
        const migrated: StoryboardData[] = [
          {
            id: 'sb-default',
            title: 'Main Storyboard',
            description: 'Master plot threads, beats, and scene cards',
            cards: parsedSingle.cards || [],
            links: parsedSingle.links || [],
            updatedAt: Date.now(),
          },
        ];
        saveStoredStoryboards(migrated);
        return migrated;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_STORYBOARDS;
}

export function saveStoredStoryboards(boards: StoryboardData[]) {
  localStorage.setItem(STORAGE_KEYS.STORYBOARDS, JSON.stringify(boards));
  // Keep legacy single board updated with first board for backward safety
  if (boards.length > 0) {
    localStorage.setItem(STORAGE_KEYS.STORYBOARD, JSON.stringify(boards[0]));
  }
}

export function loadStoredStoryboard(): StoryboardData {
  const boards = loadStoredStoryboards();
  return boards[0] || DEFAULT_STORYBOARD;
}

export function saveStoredStoryboard(board: StoryboardData) {
  const boards = loadStoredStoryboards();
  const index = boards.findIndex((b) => b.id === board.id);
  if (index >= 0) {
    boards[index] = board;
  } else {
    boards.push(board);
  }
  saveStoredStoryboards(boards);
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
