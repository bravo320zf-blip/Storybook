export type StoryStatus = 'drafting' | 'stuck' | 'needs-ending' | 'resting' | 'finished';

export interface BookPage {
  id: string;
  title: string;
  order: number;
  body: string;
  notes?: string; // Notes for this specific page / scene
  words?: number;
}

export interface BookChapter {
  id: string;
  title: string;
  order: number;
  summary?: string;
  notes?: string; // Notes for this chapter (outline, pacing, goals)
  pages: BookPage[];
}

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
  notes?: string; // Notes for the entire book / manuscript
  chapters?: BookChapter[];
  activeChapterId?: string;
  activePageId?: string;
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

export type CardKind = 'note' | 'beat' | 'character' | 'place' | 'idea' | 'map' | 'media';

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
  imageUrl?: string;
  youtubeUrl?: string;
  tag?: string;
  checklist?: { id: string; text: string; done: boolean }[];
}

export interface StoryboardLink {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  color?: string;
}

export interface StoryboardData {
  id: string;
  title: string;
  description?: string;
  cards: StoryboardCard[];
  links: StoryboardLink[];
  updatedAt: number;
  // Attachment associations
  storyId?: string;     // Attached to a specific Book/Story
  chapterId?: string;   // Attached to a specific Chapter in that Book
  mapId?: string;       // Attached to a specific Map
  locationId?: string;  // Attached to a specific Location/Stamp on that Map
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
export type MapStyle = 'wash' | 'night' | 'parchment' | 'sylvan';

export interface MapStamp {
  id: string;
  type: string;
  x: number;
  y: number;
  scale: number;
  rotation?: number;
  label?: string;
  color?: string;
  storyboardId?: string; // Direct link to an attached storyboard
}

export interface MapPath {
  id: string;
  type: 'coast' | 'river' | 'road' | 'border';
  points: { x: number; y: number }[];
  color?: string;
  strokeWidth?: number;
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
  chapterId?: string;
  stamps: MapStamp[];
  paths?: MapPath[];
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
