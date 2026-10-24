import { Story, Character, StoryboardData, WorldMap, WritingStats, UserConfig } from '../types';

export const DEFAULT_STORIES: Story[] = [
  {
    id: 'story-1',
    title: 'A Vow of Ash and Wing',
    genre: 'Fantasy',
    status: 'drafting',
    words: 1420,
    edited: Date.now() - 3600 * 1000 * 2,
    summary: 'Rhea survived the Gauntlet, but the war-drake that chose her is burning through her.',
    body: `The heat in Rhea’s sternum had stopped feeling like a spark and began to feel like an anvil settling into cold water.

She leaned against the parapet of the High Reach, watching the fog drift across the jagged spine of the mountains below. Behind her, in the cavernous warmth of the nesting arch, the beast stirred. Its scales clicked against the basalt like dry leaves in winter.

"You should sleep," Malcolm said, his boots crunching over iron dust as he stepped onto the terrace. He held a brass lantern in one hand and a horn of spiced tallow in the other. "Tomorrow the riders from the lower valleys arrive. They will want to see if the drake obeys you."

Rhea pulled her wool collar higher against the dawn wind. "He doesn't obey me, Malcolm. He tolerates my heartbeat because it beats at the same tempo as his."

The drake sighed—a low, sulfurous rumble that sent a tremble through the floorstones. Malcolm stopped two paces back, his knuckles whitening on the lantern handle. Even after three seasons in the Eyrie, the sight of a full-winged dread-drake was enough to unseat a man's courage.

"The council won't accept tolerance," Malcolm murmured. "They require allegiance."

"Then the council can come climb the mountain and deliver the saddle themselves."`,
  },
  {
    id: 'story-2',
    title: 'The Lighthouse at Renn',
    genre: 'Mystery / Gothic',
    status: 'resting',
    words: 980,
    edited: Date.now() - 86400 * 1000 * 3,
    summary: 'The keeper read the last letter, and left the lamp burning anyway.',
    body: `The waves hammered the black basalt foundation of Renn Light until the salt crust on the windowpanes trembled like thin parchment.

Alden kept the wick trimmed with steady fingers. For forty-two years, the Admiralty had sent their supply schooner on the first Tuesday of each month. But October had passed without a sail on the grey horizon, and now the third gale of November was howling off the Shoals of Sorrow.

On the iron desk in the lantern room lay the letter that had arrived on the last pilot boat before the freeze. The seal was royal violet, cracked down the middle.

"Let the beacon go dark on the winter solstice," it read in neat, indifferent clerk’s ink. "The trade lines have shifted south to Port Catherine. The Crown no longer guarantees maintenance for the northern rim."

Alden watched the beam sweep out into the roaring dark, catching the white teeth of the breakers three miles out. Somewhere out in that pitch, he knew, the independent fishermen of Skiff Bay were running blind before the squall.

He laid his brass shears down on the logbook. Then he walked to the oil reserve and cracked open another cask of whale fat.`,
  },
  {
    id: 'story-3',
    title: 'Letters from the Iron Orchard',
    genre: 'Historical / Speculative',
    status: 'needs-ending',
    words: 2310,
    edited: Date.now() - 86400 * 1000 * 7,
    summary: 'In the valley of mechanical fruit trees, an apprentice discovers the copper clockwork seeds.',
    body: `The fruit ripened not with the sun, but with the winding of the great clock in the valley tower.

Every morning before dawn, Elise carried her leather bag and oil can between the rows of verdigris-dusted boughs. Where ordinary trees bore plums and apples, the orchard bore brass spheres that chimed when the wind stirred them.

"Listen closely to the third row," Master Varos had told her before he took sick. "If you hear an uneven click in the core, strip the branch before noon. A rusted gear inside an apple will seize the whole grove."

Today, however, the clicking was not uneven. It was rhythmically accelerating—almost like a heartbeat beneath thin copper skin.`,
  },
];

export const DEFAULT_CHARACTERS: Character[] = [
  {
    id: 'char-1',
    name: 'Rhea Voss',
    role: 'protagonist',
    archetype: 'The Reluctant Vessel',
    tagline: 'Bound to a creature that is burning her from within.',
    avatarColor: '#B0567A',
    traits: ['Fierce', 'Guarded', 'Perceptive', 'Exhausted'],
    wound: 'Betrayed by her former flight commander during the winter siege of Val-Kora.',
    fear: 'Losing her sanity as the drake’s ancient consciousness overwrites her own.',
    lie: '"If I remain completely detached, the fire cannot consume what I care about."',
    want: 'To survive the trial of the Eyrie and prove she was not an accident.',
    motivation: 'To avenge her fallen squadron and protect her younger sister in the lower valley.',
    need: 'To learn that surrender to vulnerability is the only way to bond without burning.',
    arc: 'From an isolated survivor running on defiance to a leader who shares the burden of the flame.',
    notes: 'Carries a silver clasp on her flight coat from her sister. Scars along her left forearm glow faintly when the drake is agitated.',
    created: Date.now(),
  },
  {
    id: 'char-2',
    name: 'Malcolm Sedge',
    role: 'supporting',
    archetype: 'The Steadfast Archivist',
    tagline: 'Knows every verse in the drake riders’ lore, yet has never touched a scale.',
    avatarColor: '#1D9E75',
    traits: ['Methodical', 'Cautious', 'Loyal', 'Quietly courageous'],
    wound: 'Passed over for the dragon trials due to childhood lung fever.',
    fear: 'That history will repeat itself and the Eyrie will be reduced to cinder once more.',
    lie: '"Books and ledgers are sufficient shields against the world outside."',
    want: 'To keep Rhea alive and fulfill his oath to the old Archon.',
    motivation: 'A deep sense of duty and unspoken reverence for the Eyrie’s wild legacy.',
    need: 'To step out from behind the parchment and take an active stand when politics turn treacherous.',
    arc: 'Moves from cautious bystander to an indispensable strategist willing to defy the council.',
    notes: 'Keeps a pocket timepiece engraved with the constellation of the Drake.',
    created: Date.now(),
  },
  {
    id: 'char-3',
    name: 'Archon Vane',
    role: 'antagonist',
    archetype: 'The Pragmatic Tyrant',
    tagline: 'Believes peace is forged only through overwhelming dread.',
    avatarColor: '#9d6b4a',
    traits: ['Calculating', 'Imposing', 'Unflinching', 'Patient'],
    wound: 'Lost the southern provinces during the War of the Broken Bells.',
    fear: 'That without an iron hand, the realm will disintegrate into warlord anarchy.',
    lie: '"The lives of a few riders are an acceptable cost for the stability of a million."',
    want: 'To command the bonded war-drake as the crown’s ultimate deterrent.',
    motivation: 'Ensuring his legacy as the unifier of the Five Valleys.',
    need: 'To realize that power without consent breeds the very rebellion he fears.',
    arc: 'Grows increasingly desperate as Rhea’s bond proves impossible to coerce.',
    notes: 'Never raises his voice. Wears a signet ring cast from meteoric iron.',
    created: Date.now(),
  },
];

export const DEFAULT_STORYBOARD: StoryboardData = {
  cards: [
    {
      id: 'sb-1',
      kind: 'idea',
      title: 'A war-drake’s bond',
      body: 'What if the bond isn’t telepathy, but metabolic? The drake’s fire runs through her veins.',
      x: 40,
      y: 40,
      width: 240,
      color: '#E7E1F0',
    },
    {
      id: 'sb-2',
      kind: 'place',
      title: 'The Aerie Reach',
      body: 'Cliffside eyrie carved into black basalt. Smells of sulfur, ozone, and old snow.',
      x: 580,
      y: 40,
      width: 240,
      color: '#DFEAE4',
    },
    {
      id: 'sb-3',
      kind: 'character',
      title: 'Rhea Voss',
      body: 'Dragon-rider, haunted by the Gauntlet. Her left arm glows when the drake roars.',
      x: 310,
      y: 160,
      width: 240,
      color: '#F1E2E0',
    },
    {
      id: 'sb-4',
      kind: 'note',
      title: 'Does the ledger name her wing?',
      body: 'Malcolm discovered an omitted page in the council records from forty years ago.',
      x: 580,
      y: 280,
      width: 240,
      color: '#ECE4D7',
    },
    {
      id: 'sb-5',
      kind: 'beat',
      title: 'The drake won’t land',
      body: 'First flight over the Aerie. Rhea loses altitude control as the valley archers draw bows.',
      x: 310,
      y: 420,
      width: 240,
      color: '#DCE9EE',
    },
  ],
  links: [
    { id: 'link-1', fromId: 'sb-1', toId: 'sb-3', label: 'Binds' },
    { id: 'link-2', fromId: 'sb-3', toId: 'sb-2', label: 'Inhabits' },
    { id: 'link-3', fromId: 'sb-3', toId: 'sb-5', label: 'Leads to' },
    { id: 'link-4', fromId: 'sb-4', toId: 'sb-5', label: 'Complicates' },
  ],
};

export const DEFAULT_MAP: WorldMap = {
  id: 'map-1',
  name: 'The Kingdoms of Varrow',
  kind: 'realm',
  style: 'wash',
  aspect: 'screen',
  stamps: [
    { id: 'stamp-1', type: 'castle', x: 260, y: 150, scale: 1.2, label: 'High Eyrie' },
    { id: 'stamp-2', type: 'city', x: 450, y: 220, scale: 1.1, label: 'Crown City' },
    { id: 'stamp-3', type: 'tower', x: 120, y: 280, scale: 1.0, label: 'Renn Light' },
    { id: 'stamp-4', type: 'tavern', x: 380, y: 290, scale: 0.9, label: 'Crossroads Inn' },
    { id: 'stamp-5', type: 'dragon', x: 180, y: 80, scale: 1.3, label: 'Wyrm Crest' },
    { id: 'stamp-6', type: 'serpent', x: 50, y: 340, scale: 1.1, label: 'Abyssal Deep' },
    { id: 'stamp-7', type: 'compass', x: 520, y: 70, scale: 1.0 },
  ],
  realms: [
    { id: 'realm-1', name: 'Upper Valleys', color: '#9d6b4a', path: 'M 100,50 Q 250,30 350,100 T 280,240 T 120,200 Z' },
    { id: 'realm-2', name: 'The Reach of Dawn', color: '#737868', path: 'M 350,100 Q 550,80 580,220 T 420,320 T 280,240 Z' },
  ],
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
    streakDays: 4,
    totalStories,
    totalIdeas,
    history: {},
  };
}
