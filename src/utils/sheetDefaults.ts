import {
  AbilityScores,
  Dnd5eCharacterSheet,
  Dnd5eMonsterSheet,
  ShadowdarkCharacterSheet,
  ShadowdarkMonsterSheet,
  ValiantCharacterSheet,
  ValiantMonsterSheet,
  CustomSystemSheet,
} from '../types';

export function get5eModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function getShadowdarkModifier(score: number): number {
  if (score <= 3) return -4;
  if (score <= 5) return -3;
  if (score <= 7) return -2;
  if (score <= 9) return -1;
  if (score <= 11) return 0;
  if (score <= 13) return 1;
  if (score <= 15) return 2;
  if (score <= 17) return 3;
  return 4;
}

export const DND5E_SKILLS = [
  { name: 'Acrobatics', stat: 'dex' },
  { name: 'Animal Handling', stat: 'wis' },
  { name: 'Arcana', stat: 'int' },
  { name: 'Athletics', stat: 'str' },
  { name: 'Deception', stat: 'cha' },
  { name: 'History', stat: 'int' },
  { name: 'Insight', stat: 'wis' },
  { name: 'Intimidation', stat: 'cha' },
  { name: 'Investigation', stat: 'int' },
  { name: 'Medicine', stat: 'wis' },
  { name: 'Nature', stat: 'int' },
  { name: 'Perception', stat: 'wis' },
  { name: 'Performance', stat: 'cha' },
  { name: 'Persuasion', stat: 'cha' },
  { name: 'Religion', stat: 'int' },
  { name: 'Sleight of Hand', stat: 'dex' },
  { name: 'Stealth', stat: 'dex' },
  { name: 'Survival', stat: 'wis' },
] as const;

export function getDefaultDnd5eSheet(): Dnd5eCharacterSheet {
  return {
    classLevel: 'Fighter 1',
    race: 'Human',
    background: 'Folk Hero',
    alignment: 'Neutral Good',
    xp: '0',
    stats: { str: 15, dex: 13, con: 14, int: 10, wis: 12, cha: 8 },
    savingThrows: { str: true, con: true },
    skills: { Athletics: true, Survival: true },
    ac: 16,
    initiative: 1,
    speed: '30 ft',
    hpMax: 12,
    hpCurrent: 12,
    hpTemp: 0,
    hitDice: '1d10',
    proficiencyBonus: 2,
    deathSaves: { successes: 0, failures: 0 },
    passivePerception: 13,
    attacks: [
      {
        id: 'atk-1',
        name: 'Longsword',
        bonus: '+4',
        damage: '1d8+2',
        type: 'Slashing',
        range: '5 ft',
        notes: 'Versatile (1d10)',
      },
      {
        id: 'atk-2',
        name: 'Shortbow',
        bonus: '+3',
        damage: '1d6+1',
        type: 'Piercing',
        range: '80/320 ft',
        notes: 'Two-handed, Ammunition',
      },
    ],
    featuresTraits: 'Second Wind (1d10+1 hp bonus action, 1/rest).\nFighting Style: Defense (+1 AC).',
    equipment: 'Chain mail, explorer’s pack, shield, 20 arrows.',
    currency: { cp: 0, sp: 0, ep: 0, gp: 15, pp: 0 },
  };
}

export function getDefaultDnd5eMonster(): Dnd5eMonsterSheet {
  return {
    size: 'Medium',
    type: 'Monstrosity',
    alignment: 'Neutral Evil',
    ac: '14 (natural armor)',
    hp: '45 (6d8 + 18)',
    speed: '30 ft., climb 30 ft.',
    stats: { str: 16, dex: 14, con: 16, int: 6, wis: 12, cha: 7 },
    savingThrows: 'Str +5, Con +5',
    skills: 'Perception +3, Stealth +4',
    vulnerabilities: '',
    resistances: 'Cold',
    immunities: 'Poison',
    conditionImmunities: 'Poisoned',
    senses: 'Darkvision 60 ft., passive Perception 13',
    languages: 'Undercommon',
    cr: '2 (450 XP)',
    proficiencyBonus: 2,
    traits: [
      {
        id: 'trait-1',
        name: 'Ambusher',
        description: 'In the first round of combat, this creature has advantage on attack rolls against any creature that hasn’t taken a turn.',
      },
    ],
    actions: [
      {
        id: 'act-1',
        name: 'Multiattack',
        description: 'Makes two claw attacks or one bite and one claw attack.',
      },
      {
        id: 'act-2',
        name: 'Bite',
        description: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 8 (1d10 + 3) piercing damage.',
      },
      {
        id: 'act-3',
        name: 'Claw',
        description: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) slashing damage.',
      },
    ],
    bonusActions: [],
    reactions: [],
    legendaryActions: [],
  };
}

export function getDefaultShadowdarkSheet(): ShadowdarkCharacterSheet {
  return {
    characterClass: 'Fighter',
    ancestry: 'Human',
    level: 1,
    title: 'Warrior',
    alignment: 'Neutral',
    deity: 'St. Terragnis',
    background: 'Blacksmith',
    stats: { str: 14, dex: 12, con: 14, int: 9, wis: 10, cha: 8 },
    ac: 14,
    hpMax: 8,
    hpCurrent: 8,
    speed: 'Near',
    attacks: [
      {
        id: 'atk-1',
        name: 'Bastard Sword',
        bonus: '+2',
        damage: '1d8',
        type: 'Melee',
        range: 'Close',
        notes: '2-handed for 1d10',
      },
      {
        id: 'atk-2',
        name: 'Dagger',
        bonus: '+2',
        damage: '1d4',
        type: 'Melee / Thrown',
        range: 'Close / Near',
      },
    ],
    gearSlots: [
      { id: 'g-1', name: 'Torch (1 hr)', slots: 1, torchHours: 1 },
      { id: 'g-2', name: 'Torch (1 hr)', slots: 1, torchHours: 1 },
      { id: 'g-3', name: 'Rations (3 days)', slots: 1 },
      { id: 'g-4', name: 'Iron Spikes (10)', slots: 1 },
      { id: 'g-5', name: 'Rope, hemp (60 ft)', slots: 1 },
      { id: 'g-6', name: 'Chainmail armor', slots: 2 },
      { id: 'g-7', name: 'Shield', slots: 1 },
    ],
    maxSlots: 10,
    talents: 'Hauler: Add CON modifier to your total gear slots.\nWeapon Mastery: +1 to attack and damage with chosen weapon.',
    spells: '',
    gold: 24,
  };
}

export function getDefaultShadowdarkMonster(): ShadowdarkMonsterSheet {
  return {
    level: 3,
    alignment: 'Chaotic',
    ac: 13,
    hp: '14',
    movement: 'Near',
    attacks: '2 claws +3 (1d6) and 1 bite +3 (1d8 + venom DC 11 CON)',
    stats: { str: 14, dex: 12, con: 12, int: 6, wis: 10, cha: 6 },
    specials: 'Darkvision. Surprise: Surprises on a 1-2 on d6. Venom: DC 11 CON or paralyzed 1d4 rounds.',
  };
}

export function getDefaultValiantSheet(): ValiantCharacterSheet {
  return {
    classLevel: 'Fighter 1',
    lineage: 'Human',
    heritage: 'Fire-Touched',
    background: 'Soldier',
    alignment: 'Lawful Neutral',
    stats: { str: 15, dex: 13, con: 14, int: 10, wis: 12, cha: 8 },
    ac: 16,
    speed: '30 ft',
    hpMax: 12,
    hpCurrent: 12,
    hpTemp: 0,
    hitDice: '1d10',
    luckMax: 3,
    luckCurrent: 3,
    perceptionPassive: 13,
    stealthPassive: 11,
    attacks: [
      {
        id: 'atk-1',
        name: 'Greatsword',
        bonus: '+4',
        damage: '2d6+2',
        type: 'Slashing',
        range: '5 ft',
        notes: 'Heavy, Two-Handed',
      },
    ],
    talents: 'Weapon Mastery: Greatsword.\nSecond Wind: 1d10+1 HP on bonus action (1/rest).',
    spells: '',
    equipment: 'Ring mail, greatsword, dagger, explorer’s pack, 10 gp.',
  };
}

export function getDefaultValiantMonster(): ValiantMonsterSheet {
  return {
    size: 'Large',
    creatureType: 'Fiend (Demon)',
    alignment: 'Chaotic Evil',
    cr: '3 (700 XP)',
    ac: '14 (natural armor)',
    hp: '59 (7d10 + 21)',
    speed: '40 ft.',
    stats: { str: 17, dex: 12, con: 16, int: 8, wis: 11, cha: 12 },
    doomPoints: 2,
    perception: 12,
    stealth: 11,
    senses: 'Darkvision 120 ft., passive Perception 12',
    languages: 'Abyssal, telepathy 60 ft.',
    resistances: 'Cold, fire, lightning',
    traits: [
      {
        id: 't-1',
        name: 'Stench of the Pit',
        description: 'Any creature that starts its turn within 5 ft must succeed on a DC 13 CON save or be poisoned until the start of its next turn.',
      },
    ],
    actions: [
      {
        id: 'act-1',
        name: 'Multiattack',
        description: 'The creature makes two attacks: one with its bite and one with its gore.',
      },
      {
        id: 'act-2',
        name: 'Bite',
        description: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 12 (2d8 + 3) piercing damage.',
      },
      {
        id: 'act-3',
        name: 'Gore',
        description: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) piercing damage.',
      },
    ],
    bonusActions: [],
    reactions: [],
  };
}

export function getDefaultCustomSheet(): CustomSystemSheet {
  return {
    systemName: 'My Custom RPG',
    attributes: [
      { id: 'attr-1', name: 'Brawn', value: '4' },
      { id: 'attr-2', name: 'Agility', value: '3' },
      { id: 'attr-3', name: 'Wits', value: '2' },
      { id: 'attr-4', name: 'Resolve', value: '3' },
    ],
    resourcePools: [
      { id: 'pool-1', name: 'Health', current: 20, max: 20 },
      { id: 'pool-2', name: 'Stamina / Mana', current: 10, max: 10 },
      { id: 'pool-3', name: 'Sanity', current: 80, max: 100 },
    ],
    skills: [
      { id: 'sk-1', name: 'Melee Combat', value: '+3' },
      { id: 'sk-2', name: 'Stealth & Infiltration', value: '+2' },
      { id: 'sk-3', name: 'Occult Knowledge', value: '+1' },
      { id: 'sk-4', name: 'Investigation', value: '+2' },
    ],
    attacks: [
      {
        id: 'atk-1',
        name: 'Energy Blade',
        bonus: '+5',
        damage: '2d8+3',
        type: 'Plasma / Energy',
        range: 'Melee',
        notes: 'Armor Piercing',
      },
      {
        id: 'atk-2',
        name: 'Heavy Handcannon',
        bonus: '+4',
        damage: '3d6',
        type: 'Kinetic',
        range: '30m',
        notes: 'Capacity 6 rounds',
      },
    ],
    powersAbilities: 'Overcharge: Spend 2 Stamina to add +1d8 damage to any energy strike.\nSixth Sense: Roll Wits with advantage when detecting ambushes.',
    notes: 'Equipment, inventory, affiliations, and campaign lore.',
  };
}
