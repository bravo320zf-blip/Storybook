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

export type EntityKind = 'character' | 'monster';
export type SheetSystem = 'narrative' | 'dnd5e' | 'shadowdark' | 'valiant' | 'custom';

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface AttackEntry {
  id: string;
  name: string;
  bonus: string;
  damage: string;
  type?: string;
  range?: string;
  notes?: string;
}

export interface SpellSlot {
  level: number;
  total: number;
  used: number;
}

export interface TraitEntry {
  id: string;
  name: string;
  description: string;
}

// 1. D&D 5E Character Sheet
export interface Dnd5eCharacterSheet {
  classLevel: string;
  race: string;
  background: string;
  alignment: string;
  xp: string;
  stats: AbilityScores;
  savingThrows: { [key in keyof AbilityScores]?: boolean };
  skills: { [skillName: string]: boolean };
  ac: number;
  initiative: number;
  speed: string;
  hpMax: number;
  hpCurrent: number;
  hpTemp: number;
  hitDice: string;
  proficiencyBonus: number;
  deathSaves: { successes: number; failures: number };
  passivePerception: number;
  attacks: AttackEntry[];
  spellcastingAbility?: string;
  spellSaveDc?: number;
  spellAttackBonus?: number;
  spellSlots?: SpellSlot[];
  spellsKnown?: string;
  featuresTraits?: string;
  equipment?: string;
  currency?: { cp: number; sp: number; ep: number; gp: number; pp: number };
}

// 2. D&D 5E Monster Sheet
export interface Dnd5eMonsterSheet {
  size: string;
  type: string;
  alignment: string;
  ac: string;
  hp: string;
  speed: string;
  stats: AbilityScores;
  savingThrows: string;
  skills: string;
  vulnerabilities: string;
  resistances: string;
  immunities: string;
  conditionImmunities: string;
  senses: string;
  languages: string;
  cr: string;
  proficiencyBonus: number;
  traits: TraitEntry[];
  actions: TraitEntry[];
  bonusActions: TraitEntry[];
  reactions: TraitEntry[];
  legendaryActions: TraitEntry[];
}

// 3. ShadowDark Character Sheet
export interface ShadowdarkCharacterSheet {
  characterClass: string;
  ancestry: string;
  level: number;
  title: string;
  alignment: 'Lawful' | 'Neutral' | 'Chaotic';
  deity: string;
  background: string;
  stats: AbilityScores;
  ac: number;
  hpMax: number;
  hpCurrent: number;
  speed: string; // Close, Near, Far
  attacks: AttackEntry[];
  gearSlots: { id: string; name: string; slots: number; torchHours?: number }[];
  maxSlots: number;
  talents: string;
  spells: string;
  gold: number;
}

// 4. ShadowDark Monster Sheet
export interface ShadowdarkMonsterSheet {
  level: number;
  alignment: 'Lawful' | 'Neutral' | 'Chaotic';
  ac: number;
  hp: string;
  movement: string;
  attacks: string; // e.g. "2 claws +3 (1d6) and 1 bite +3 (1d8 + poison)"
  stats: AbilityScores;
  specials: string;
}

// 5. Tales of the Valiant Character Sheet
export interface ValiantCharacterSheet {
  classLevel: string;
  lineage: string;
  heritage: string;
  background: string;
  alignment: string;
  stats: AbilityScores;
  ac: number;
  speed: string;
  hpMax: number;
  hpCurrent: number;
  hpTemp: number;
  hitDice: string;
  luckMax: number;
  luckCurrent: number;
  perceptionPassive: number;
  stealthPassive: number;
  attacks: AttackEntry[];
  talents: string;
  spells: string;
  equipment: string;
}

// 6. Tales of the Valiant Monster Sheet
export interface ValiantMonsterSheet {
  size: string;
  creatureType: string;
  alignment: string;
  cr: string;
  ac: string;
  hp: string;
  speed: string;
  stats: AbilityScores;
  doomPoints: number;
  perception: number;
  stealth: number;
  senses: string;
  languages: string;
  resistances: string;
  traits: TraitEntry[];
  actions: TraitEntry[];
  bonusActions: TraitEntry[];
  reactions: TraitEntry[];
}

// 7. Custom Homebrew System Sheet
export interface CustomAttribute {
  id: string;
  name: string;
  value: string;
}

export interface CustomResourcePool {
  id: string;
  name: string;
  current: number;
  max: number;
}

export interface CustomSystemSheet {
  systemName: string;
  attributes: CustomAttribute[];
  resourcePools: CustomResourcePool[];
  skills: { id: string; name: string; value: string }[];
  attacks: AttackEntry[];
  powersAbilities: string;
  notes: string;
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

  // Game System Sheet Attachments
  entityKind?: EntityKind;       // 'character' | 'monster'
  sheetSystem?: SheetSystem;     // 'narrative' | 'dnd5e' | 'shadowdark' | 'valiant' | 'custom'
  dnd5eSheet?: Dnd5eCharacterSheet;
  dnd5eMonster?: Dnd5eMonsterSheet;
  shadowdarkSheet?: ShadowdarkCharacterSheet;
  shadowdarkMonster?: ShadowdarkMonsterSheet;
  valiantSheet?: ValiantCharacterSheet;
  valiantMonster?: ValiantMonsterSheet;
  customSheet?: CustomSystemSheet;
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
