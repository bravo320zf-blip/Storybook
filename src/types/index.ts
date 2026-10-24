export type StoryStatus = 'drafting' | 'stuck' | 'needs-ending' | 'resting' | 'finished';

export interface Story {
  id: string;
  title: string;
  genre?: string;
  status: StoryStatus;
  words: number;
  edited: number;
  body: string;
  summary: string;
  cover?: string;
  coverSvg?: string;
  projectId?: string;
  order?: number;
  gdriveFileId?: string;
  gdriveLastSynced?: number;
  notes?: string;
}

export interface Project {
  id: string;
  title: string;
  kind: 'novel' | 'anthology' | 'series' | 'notes';
  status: StoryStatus;
  createdAt: number;
  scene?: string;
  description?: string;
}

export type CardKind = 'note' | 'beat' | 'character' | 'place' | 'idea' | 'map';

export interface StoryboardCard {
  id: string;
  kind: CardKind;
  title: string;
  body: string;
  x: number;
  y: number;
  width?: number;
  storyId?: string; // specific story or 'all'
  color?: string;
}

export interface StoryboardLink {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
}

export interface StoryboardData {
  cards: StoryboardCard[];
  links: StoryboardLink[];
}

export interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'mentor' | 'rival';
  archetype: string;
  storyId?: string;
  tagline: string;
  avatarColor: string;
  traits: string[];
  wound: string;
  fear: string;
  lie: string;
  want: string;
  motivation: string;
  need: string;
  arc: string;
  notes: string;
  appearance?: string;
  created: number;
}

export type MapAspect = 'screen' | 'book' | 'poster' | 'square' | 'wide';
export type MapStyle = 'wash' | 'night' | 'parchment';

export interface MapStamp {
  id: string;
  type: string; // 'castle' | 'city' | 'tower' | 'tavern' | 'mountain' | 'tree' | 'dragon' | 'serpent' | 'compass' | 'ship'
  x: number;
  y: number;
  scale: number;
  label?: string;
}

export interface MapRealm {
  id: string;
  name: string;
  color: string;
  path: string;
}

export interface WorldMap {
  id: string;
  name: string;
  kind: 'realm' | 'city';
  style: MapStyle;
  aspect: MapAspect;
  storyId?: string;
  stamps: MapStamp[];
  realms: MapRealm[];
  notes?: string;
  updatedAt: number;
}

export interface WritingStats {
  totalWords: number;
  wordsThisWeek: number;
  streakDays: number;
  totalStories: number;
  totalIdeas: number;
  lastWriteDate?: string;
  history: Record<string, number>; // date "YYYY-MM-DD" -> word count
}

export interface SprintSession {
  active: boolean;
  durationMinutes: number;
  remainingSeconds: number;
  startWordCount: number;
  wordsWritten: number;
  targetWordCount?: number;
}

export interface UserConfig {
  theme: 'clay' | 'parchment' | 'slate' | 'forest' | 'night';
  font: 'serif' | 'sans' | 'mono';
  darkMode: boolean;
  googleClientId?: string;
  googleDriveFolderId?: string;
  googleDriveFolderName: string;
  googleUserEmail?: string;
  googleAccessToken?: string;
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  firebaseStorageBucket?: string;
  firebaseAppId?: string;
  autoSyncDrive: boolean;
}
