// =======================================================================
// MUSE CREATIVE GENERATOR & PROCEDURAL ORACLE ENGINE
// 100% Free, offline, zero-token cost with millions of unique permutations
// =======================================================================

export type MuseGenre = 'fantasy' | 'grimdark' | 'scifi' | 'horror' | 'mystery' | 'mythic';

export interface GeneratedCharacter {
  name: string;
  epithet: string;
  archetype: string;
  role: string;
  wound: string;
  lie: string;
  want: string;
  need: string;
  quirk: string;
  signatureItem: string;
}

export interface GeneratedMonster {
  name: string;
  nature: string;
  ability: string;
  lair: string;
  weakness: string;
  tactic: string;
  dangerLevel: string;
}

export interface GeneratedHook {
  title: string;
  incitingEvent: string;
  tickingClock: string;
  hiddenStakes: string;
}

export interface GeneratedTwist {
  title: string;
  twist: string;
  implication: string;
}

export interface GeneratedPlace {
  name: string;
  descriptor: string;
  feature: string;
  sensory: string;
  hazard: string;
}

export interface GeneratedRelic {
  name: string;
  appearance: string;
  power: string;
  cost: string;
}

export interface GeneratedDilemma {
  title: string;
  situation: string;
  choiceA: string;
  choiceB: string;
}

export interface GeneratedDialogue {
  speaker: string;
  context: string;
  quote: string;
}

export interface MasterSceneSpark {
  title: string;
  protagonist: string;
  catalyst: string;
  threat: string;
  twist: string;
  stakes: string;
}

// -------------------------------------------------------------
// Helper: Random picker
// -------------------------------------------------------------
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMultiple<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// -------------------------------------------------------------
// 1. CHARACTER NAMES & PROFILES BY GENRE
// -------------------------------------------------------------
const NAME_DATA: Record<MuseGenre, { first: string[]; last: string[]; titles: string[]; archetypes: string[] }> = {
  fantasy: {
    first: [
      'Aethel', 'Caelan', 'Lyra', 'Theron', 'Vesper', 'Soren', 'Isolde', 'Corvus',
      'Branoc', 'Rowan', 'Sylas', 'Orlaith', 'Cassian', 'Maren', 'Bram', 'Evander',
      'Seraphina', 'Gideon', 'Althea', 'Valen', 'Dorian', 'Morwen', 'Finnian', 'Elowen',
      'Tamsin', 'Rhiannon', 'Alden', 'Cora', 'Lorcan', 'Maeve', 'Gareth', 'Briar',
    ],
    last: [
      'Blackwood', 'Ashford', 'Val-Kora', 'Ironthorn', 'Duskward', 'Crestfall', 'Oakhaven',
      'Wintermute', 'Ravenscar', 'Holloway', 'Thornwall', 'Stormvale', 'Nightshade',
      'Silverfall', 'Crownwreath', 'Emberfell', 'Greywood', 'Swiftwind', 'Frostmere',
      'Briarwood', 'Moonveil', 'Wyrmrest', 'Gildenhall', 'Starling', 'Barrow-Down',
    ],
    titles: [
      'the Ashen', 'the Unbroken', 'of the High Marches', 'the Far-Strider', 'the Silver-Tongued',
      'the Silent', 'the Oathbound', 'the Shadow-Weaver', 'of the Gilded Gate', 'the Wandering Flame',
      'the Reluctant', 'the Star-Eyed', 'the Wolf of the Barrow', 'the Thorn-Crown',
    ],
    archetypes: [
      'Exiled Prince carrying a cursed heirloom',
      'Disgraced Inquisitor hunting an eldritch heretic',
      'Apprentice Mage whose spells consume their own memories',
      'Veteran Shield-Bearer seeking an honorable death',
      'Street Scavenger who uncovers an imperial plot',
      'Falconer whose raptor sees through the veil of death',
      'Oath-breaker Paladin seeking redemptive doom',
    ],
  },
  grimdark: {
    first: [
      'Barrow', 'Crow', 'Vance', 'Grimm', 'Malakor', 'Scythe', 'Karn', 'Greave',
      'Brant', 'Vane', 'Burl', 'Jarek', 'Moros', 'Rook', 'Torvin', 'Graves',
      'Hester', 'Dreg', 'Kaelen', 'Brimstone', 'Thane', 'Voss', 'Mordred', 'Nails',
    ],
    last: [
      'Gallowglass', 'Ironmonger', 'Marrow', 'Carrion', 'Blackbone', 'Cinderfoot',
      'Gorefang', 'Ashvessel', 'Coldgrave', 'Rotbane', 'Bloodwell', 'Silt', 'Rust',
      'Dungate', 'Sorrowless', 'Canker', 'Harrow', 'Grimhollow', 'Bone-Picker',
    ],
    titles: [
      'the Grave-Digger', 'the Red', 'the Noose-Maker', 'of the Corpse-Wagon',
      'the Unforgiven', 'the Hangman’s Hound', 'the Bone-Gnawer', 'the Bleeder',
      'of the Rust-Crawl', 'the Mutilated', 'the Scourge-Bearer',
    ],
    archetypes: [
      'Mercenary sergeant whose men died for a sack of rotten grain',
      'Plague doctor whose mask hides the very contagion they treat',
      'Grave-robber who pulled a still-breathing lich from an open sepulchre',
      'Torturer seeking forgiveness through excruciating penance',
      'Deserter knight surviving on boiled boot leather and stolen silver',
      'Alchemist blinded by their own phosphorescent fire',
    ],
  },
  scifi: {
    first: [
      'Kira', 'Jaxon', 'Vex', 'Nova', 'Echo', 'Tarek', 'Orion', 'Sloane', 'Cyrus',
      'Rhea', 'Dekker', 'Silas', 'Astra', 'Rix', 'Bix', 'Kael', 'Zero', 'Nyx',
      'Mika', 'Quinn', 'Vector', 'Lycan', 'Helix', 'Seren', 'Raze', 'Val',
    ],
    last: [
      'Vance', 'Kovacs', 'Chen', 'Okoye', 'Mercer', 'Nakamura', 'Volkov', 'Sterling',
      'Cross', 'Syn-Tec', 'Aethel-7', 'Prism', 'Blackout', 'Vanguard', 'Hyperion',
      'Solari', 'Arc-Light', 'Zero-One', 'Quasar', 'Tiberius', 'Caelum',
    ],
    titles: [
      'Grid-Runner', 'Out-System Drifter', 'Void-Born', 'Neural-Architect',
      'Null-Sector Courier', 'Black-Market Cyber-Doc', 'Exo-Recon Specialist',
      'Ghost-Hacker', 'Orbital Scavenger', 'Deep-Cold Pilot',
    ],
    archetypes: [
      'Cybernetic smuggler smuggling a synthetic human conscience',
      'Disavowed corporate security sniper with a malfunctioning optic implant',
      'Deep-void salvage captain whose ship AI developed paranoia',
      'Bio-hacker testing black-market genetic alterations on their own blood',
      'Memory broker whose clientele keeps dying of neural aneurysms',
      'Terraforming engineer who discovered that the barren planet is sentient',
    ],
  },
  horror: {
    first: [
      'Agatha', 'Silas', 'Gideon', 'Eleanor', 'Cyprian', 'Bartholomew', 'Judith',
      'Hesperia', 'Lucien', 'Absalom', 'Constance', 'Malachi', 'Patience', 'Ichabod',
      'Mortimer', 'Lavinia', 'Ambrose', 'Prudence', 'Thaddeus', 'Beatrice',
    ],
    last: [
      'Barrow', 'Dunwich', 'Carrow', 'Blackwood', 'Von Drake', 'Hallow', 'Bleakwood',
      'Ravenloft', 'Morbid', 'Van Helsing', 'Coldwell', 'Wormwood', 'Ashenspire',
      'Grave', 'Nightshade', 'Dusk', 'Wintercroft', 'Pestilence', 'Vanderbilt',
    ],
    titles: [
      'the Pale', 'the Undertaker', 'the Night-Whisperer', 'the Unhallowed',
      'of the Crying Marsh', 'the Bloodless', 'the Bell-Toller', 'the Haunt-Bound',
    ],
    archetypes: [
      'Victorian antiquarian whose pocket watch runs backwards when evil is near',
      'Asylum keeper who realized the inmates are repeating future murder reports',
      'Exorcist whose holy symbol cracked during their first ritual',
      'Medium whose spirit guides are frantically warning them to stop listening',
      'Taxidermist who received a specimen that refuses to stay deceased',
      'Grave-watcher who heard rhythmic knocking beneath the oldest crypt',
    ],
  },
  mystery: {
    first: [
      'Vincent', 'Callum', 'Clara', 'Arthur', 'Genevieve', 'Victor', 'Helena',
      'Raymond', 'Faye', 'Marcus', 'Vivian', 'Dominic', 'Collette', 'Leo',
      'Frank', 'Gwen', 'Patrick', 'Sylvia', 'Julian', 'Nora',
    ],
    last: [
      'Marlowe', 'Sterling', 'Blackstone', 'Holloway', 'Cross', 'Finch', 'Crane',
      'Pendleton', 'Mercer', 'Vance', 'Kingsley', 'Archer', 'Dunne', 'Sinclair',
    ],
    titles: [
      'Private Eye', 'Forensic Inquisitor', 'Inspector', 'The Wire-Tapper',
      'The Fixer', 'The Courier', 'The Blackmail Broker', 'The Shadow Analyst',
    ],
    archetypes: [
      'Disgraced detective investigating the murder of their estranged partner',
      'Journalist who received the transcript of an interrogation that hasn’t happened yet',
      'Safe-cracker recruited to crack a safe inside an ocean liner in mid-voyage',
      'Coroner who discovers identical arsenic traces across three unrelated high-society deaths',
      'Undercover operative whose agency erased their file and forgot they exist',
    ],
  },
  mythic: {
    first: [
      'Perseus', 'Atalanta', 'Orion', 'Kassandra', 'Daedalus', 'Hector', 'Icarus',
      'Thalia', 'Cadmus', 'Penthesilea', 'Ajax', 'Evander', 'Cassandra', 'Tydeus',
    ],
    last: [
      'of Mycenae', 'Aethel-born', 'Storm-caller', 'of the Golden Fleece', 'Iron-Stride',
      'the Sun-Blessed', 'of the Delphic Rim', 'Dragon-Blooded', 'Sea-Farer',
    ],
    titles: [
      'Bane of the Chimera', 'the Spear-Singer', 'Beloved of the Sea', 'the Oracle-Blind',
      'the Fire-Bringer', 'of the Iron Shield', 'the Chariot-Master',
    ],
    archetypes: [
      'Hero cursed with immortality until they strike down their own offspring',
      'Oracle who saw the ruin of their city but is doomed never to be believed',
      'Demigod champion whose strength fades with every lie they utter',
      'Shipwright who fashioned a galley from wood taken from the underworld',
    ],
  },
};

// -------------------------------------------------------------
// NARRATIVE PSYCHOLOGY POOLS
// -------------------------------------------------------------
const WOUNDS = [
  'Watches a childhood friend drown while clinging to a chest of family coin.',
  'Executed an innocent heretic under strict orders; the victim’s eyes haunt every reflective surface.',
  'Abandoned their birth-sibling in the catacombs during the Great Purge to save their own skin.',
  'Believed their spouse perished in the war, only to discover they were willingly fighting for the enemy.',
  'Was framed for burning the city granary during winter, surviving as an outcast branded on the throat.',
  'Traded their family’s sacred ancestral sword for medicine that arrived three hours too late.',
  'Failed to pull their apprentice from the collapsing mine, hearing their tapping for four days.',
  'Surrendered the citadel gates on promise of mercy, only to witness the ensuing massacre.',
];

const LIES = [
  '“I don’t need allies; anyone close to me becomes leverage for my enemies.”',
  '“If I compromise my morals just once more, I will finally have the power to do good.”',
  '“The only true security is absolute control over everyone in the room.”',
  '“I am fundamentally tainted, and redemption is a luxury meant for softer people.”',
  '“As long as I keep running and fighting, the consequences of my past can never catch me.”',
  '“Mercy is just cowardice dressed in noble cloth.”',
];

const WANTS = [
  'Reclaim the ancestral seat and execute every usurper on the council.',
  'Steal the celestial ledger and burn the page bearing their family’s curse.',
  'Gather enough wealth to buy a derelict frigate and vanish beyond the mapped edge of the world.',
  'Find the apothecary who brewed the poison that blinded their father.',
  'Extract their captured sibling from the high-security dungeon before the eclipse.',
  'Prove to the high elders that the prophecy is a fabricated lie designed to keep people docile.',
];

const NEEDS = [
  'Learn that vulnerability and trust are weapons against isolation, not signs of weakness.',
  'Accept that vengeance will not bring back the dead, and forgive themselves for surviving.',
  'Surrender their obsession with control and let their companion make their own sacrifice.',
  'Acknowledge that they were complicit in the tragedy they blame on the world.',
  'Put down their blade and choose to build something enduring rather than destroy another enemy.',
];

const QUIRKS = [
  'Refuses to turn their back to open doorways; constantly tracks exits.',
  'Rolls an ancient lead coin across their knuckles when weighing life-and-death choices.',
  'Speaks in a rasping whisper due to old smoke damage, forcing listeners to lean in close.',
  'Carries a sealed glass vial of graveyard soil from their burned home village.',
  'Always checks their tea with a silver needle before taking the first sip.',
  'Never gives their true birth name to strangers, claiming names are binding sigils.',
  'Has intricate ink maps tattooed across their forearms representing every companion lost in battle.',
];

const ITEMS = [
  'A notched serrated dagger taken from the mercenary captain who raided their home.',
  'A cracked brass pocket watch that clicks every four seconds instead of every second.',
  'A signet ring wrapped in stained linen, its imperial crest hammered flat.',
  'A leather-bound field journal filled with sketches of faces they will never see again.',
  'A hollow ivory pendant containing a single lethal dose of nightshade oil.',
  'A whetstone made from a fallen meteor fragment that sparks cold blue sparks.',
];

// -------------------------------------------------------------
// 2. MONSTER GENERATOR DATA
// -------------------------------------------------------------
const MONSTER_PREFIXES = [
  'Grave-Gorged', 'Null-Void', 'Cinder-Scaled', 'Hollow-Eyed', 'Blight-Weaver',
  'Blood-Tallow', 'Iron-Marrow', 'Corpse-Stitched', 'Sorrow-Eater', 'Rust-Plague',
  'Frost-Veined', 'Sun-Eater', 'Carrion-Born', 'Ashen', 'Dread-Mire', 'Gallows-Bound',
];

const MONSTER_BASES = [
  'Wyrm', 'Behemoth', 'Stalker', 'Leviathan', 'Chimera', 'Strangler', 'Inquisitor',
  'Devourer', 'Colossus', 'Fiend', 'Gargoyle', 'Crawler', 'Shade', 'Wretch',
  'Manticore', 'Gorgon', 'Specter', 'Vermin-Lord', 'Bone-Gnawer', 'Abomination',
];

const MONSTER_NATURES = [
  'An ancient subterranean predator awakened by strip-mining into forgotten crypts.',
  'A biological weapon engineered centuries ago that has mutated into an ecological apex plague.',
  'The vengeful amalgam of twelve condemned soldiers executed in the iron cage of Black-Reach.',
  'A cosmic horror pulled through an unstable rift that feasts on sentient memories and warmth.',
  'An alchemical experiment gone wrong: living quicksilver and molten brass encased in chiseled stone.',
  'A corrupted forest guardian whose heartwood was pierced with an iron railway spike.',
];

const MONSTER_ABILITIES = [
  'Emits an infrasonic vibration that shatters glass, causes vertigo, and turns steel brittle.',
  'Can liquefy into black ichor and reform behind enemies, striking from dark crevices.',
  'Breath weapon of calcifying ash that petrifies flesh into chalk within seconds.',
  'Hypnotic bioluminescent glands that force onlookers to walk straight toward its maw.',
  'Regenerates wounds by consuming raw iron, stones, or nearby weapons from dead soldiers.',
  'Its screech extinguishes all open flames within sixty paces and snuffs night-vision lenses.',
];

const MONSTER_LAIRS = [
  'Submerged catacombs beneath an abandoned belltower where floodwaters turn black.',
  'A cavern carved inside the ribcage of an extinct primordial leviathan.',
  'The hollowed-out engine room of a derelict generation ship drifting in the dead zone.',
  'The sunken basements of a burned imperial library covered in weeping sulfur moss.',
  'A volcanic caldera where volcanic glass formations reflect blinding heat.',
  'A forgotten mine-shaft where the cage was intentionally cut seventy years ago.',
];

const MONSTER_WEAKNESSES = [
  'Vulnerable to high-frequency sounds produced by pure silver tuning forks.',
  'Cannot cross a barrier salted with bone ash and sulfur.',
  'Its armored chest plate exposes a pulsing heat core for three seconds after it strikes.',
  'Allergic to the sap of the ghost-willow tree, which burns its flesh like concentrated acid.',
  'Completely blind in pure darkness; relies entirely on heat and tremors.',
  'Its regeneration stalls completely if submerged in brackish marsh water.',
];

// -------------------------------------------------------------
// 3. PLOT HOOKS & INCITING INCIDENTS
// -------------------------------------------------------------
const HOOK_SUBJECTS = [
  'A messenger arrives bearing a coin sealed in lead',
  'A severed mechanical hand is found clutching an imperial cipher',
  'The deepest bell in the cathedral tolls seven times at midday',
  'A dead courier washes ashore with a living child sealed in their rucksack',
  'An iron cage kept warm with coals in the family vault suddenly cracks from the inside',
  'A blind beggar drops a signet ring into the protagonist’s cup, whispering their real birth name',
  'The protagonist receives an invitation to their own funeral scheduled for midnight tomorrow',
  'A supply train arrives at the station on time, but every passenger is frozen solid at their seats',
];

const HOOK_CATALYSTS = [
  'The sender died forty years ago, but the debt has matured and the collectors are already at the city gate.',
  'Before anyone can examine the artifact, the inquisitors seal all four city bridges and declare martial quarantine.',
  'The signature on the parchment matches the handwriting of a sibling executed seven winters ago.',
  'Inside is a detailed tactical map of the palace, with red crosses over every guard post drawn in fresh ink.',
  'The eclipse begins in twenty-six hours, and the magical ward holding the rift closed has shattered.',
  'The recipient is warned: whoever speaks the contents of this message aloud will lose their voice before dusk.',
];

const HOOK_STAKES = [
  'If they refuse the assignment, the syndicate will detonate the atmospheric scrubber above the slums.',
  'The last person who investigated this mystery was found hanging from the clocktower with their eyes sewn shut.',
  'Failing to deliver the payload within three days will trigger an all-out civil war between the northern houses.',
  'The protagonist’s own name is listed as the executioner on the royal death warrant.',
];

// -------------------------------------------------------------
// 4. PLOT TWISTS & COMPLICATIONS
// -------------------------------------------------------------
const TWIST_TEMPLATES = [
  {
    title: 'The Inverted Siege',
    twist: 'The enemy isn’t trying to breach the city walls—they are barricading your characters inside to keep whatever is waking underneath from escaping.',
    implication: 'The invaders outside are actually terrified refugees, not conquerors.',
  },
  {
    title: 'The Curative Lie',
    twist: 'The mentor had the cure the whole time, but keeping the protagonist afflicted was the only way to shield them from the inquisitors’ psychic hounds.',
    implication: 'Every moment of suffering was calculated to preserve the protagonist’s life.',
  },
  {
    title: 'The Cartographer’s Terror',
    twist: 'The sacred map does not show where the lost city was built, but where the subterranean leviathan will next surface to feed.',
    implication: 'The destination they’ve spent months marching toward is a feeding ground.',
  },
  {
    title: 'The Reluctant Puppet',
    twist: 'The rival emperor isn’t issuing these tyrant decrees; someone has been forging their seal using a duplicate signet carved from their dead child’s tooth.',
    implication: 'The true mastermind is sitting comfortably on the protagonist’s own high council.',
  },
  {
    title: 'The Hollow Weapon',
    twist: 'The legendary sword doesn’t slay gods—it requires the wielder to sacrifice one cherished memory for every life it takes.',
    implication: 'Winning the war means the hero will forget why they fought and everyone they loved.',
  },
  {
    title: 'The False Truce',
    twist: 'The peace treaty was never intended to hold; both generals signed it knowing the ink was laced with contact poison aimed at each other.',
    implication: 'Now both leaders are dying in the same tent while their armies cheer outside.',
  },
  {
    title: 'The Benefactor’s Trap',
    twist: 'The wealthy patron financing your expedition was the original criminal who caused the ruin forty years ago, and is using you to erase the evidence.',
    implication: 'Your trusted backer will execute the entire crew the moment the vault is opened.',
  },
];

// -------------------------------------------------------------
// 5. PLACES & SETTINGS
// -------------------------------------------------------------
const PLACE_MODIFIERS = [
  'The Sunken', 'The Whispering', 'The Basalt', 'The Cinder', 'The Clockwork',
  'The Weeping', 'The Iron', 'The Drowned', 'The Obsidian', 'The Shattered',
  'The Forgotten', 'The Star-Fallen', 'The Gilded', 'The Hollow', 'The Frost-Bound',
];

const PLACE_NOUNS = [
  'Spire', 'Quarry', 'Eyrie', 'Forest', 'Citadel', 'Catacombs', 'Foundry',
  'Sanctuary', 'Barrow', 'Chasm', 'Monastery', 'Gallows-Bridge', 'Orchard',
  'Necropolis', 'Trench', 'Harbor', 'Vault', 'Fen', 'Reef', 'Bazaar',
];

const PLACE_LOCALES = [
  'of Val-Kora', 'at Windward Rim', 'of St. Jude', 'of Aethelgard', 'of Varos',
  'beneath the Silt-Sea', 'in the Dead Reach', 'of the Black Sun', 'at Gallows-Point',
  'of the Iron Archons', 'in the Sunless Veil', 'of the Weeping Emperor',
];

const PLACE_FEATURES = [
  'A colossal bridge of petrified bones spanning a vaporous, bottomless fissure.',
  'Tiered hanging gardens irrigated by mineral springs that glow pale blue in the dark.',
  'An abandoned shipyard where dry-docked galleons rot amidst petrified kelp.',
  'A hollow mountain peak where wind whistling through natural tunnels sounds like human weeping.',
  'A flooded bazaar where merchants conduct auctions from black gondolas by lantern light.',
  'A towering bronze clock whose ticking reverberates through the foundation stones of the city.',
];

const PLACE_SENSORIES = [
  'Smell of bitter ozone, wet slate, and wild mountain fennel.',
  'The constant dull thrum of subterranean steam pumps rattling iron grates underfoot.',
  'Air thick with stinging volcanic ash that turns white silk gray within an hour.',
  'Silence so profound you can hear your own pulse against your temples.',
  'Pervasive reek of brine, rotting kelp, and guttering tallow candles.',
];

const PLACE_HAZARDS = [
  'Collapsing masonry, pockets of suffocating sulfur gas, and hidden pressure plates.',
  'Unstable scree slopes, sudden flash floods, and territorial nesting wyverns.',
  'Magnetic anomalies that spin compasses and draw iron weapons toward cliff walls.',
  'Toxic spore blooms that induce vivid waking hallucinations and memory lapses.',
  'Uncharted sinkholes, lurking mire-crawlers, and ancient spring-loaded bolt traps.',
  'Sudden chilling mists that extinguish open flames and numb bare skin in moments.',
  'Prowling night scavengers, treacherous slippery mudslides, and crumbling rotted rope bridges.',
  'Eerie sound-echoes that mask approaching stalkers and disorient party navigation.',
];

// -------------------------------------------------------------
// 6. ARTIFACTS & RELICS
// -------------------------------------------------------------
const RELIC_NAMES = [
  'The Lantern of Unborn Sight',
  'The Iron Hand of St. Malakor',
  'The Compass of Lost Graves',
  'The Mirror of Bitter Truths',
  'The Weaver’s Bone Needle',
  'The Ash-Bound Codex',
  'The Null-Cylinder of Varos',
  'The Cup of the Last Scent',
];

const RELIC_POWERS = [
  'Allows the bearer to speak directly with the nearest dead body for three questions.',
  'Bends projectile paths and arrows around the wielder within a five-pace radius.',
  'Reveals hidden doors, secret compartments, and invisible beings as pulsing crimson embers.',
  'Instantly cauterizes lethal wounds and stabilizes the bearer against poison.',
  'Emits a field that nullifies all gunpowder, kinetic firing mechanisms, and spark plugs nearby.',
  'Allows the bearer to step through any shadow and emerge from another shadow fifty feet away.',
];

const RELIC_COSTS = [
  'Every use drains two days of the bearer’s lifespan, leaving streaks of silver hair.',
  'The item demands a drop of fresh arterial blood before it will activate.',
  'The bearer permanently loses the memory of a beloved childhood event each time it is drawn.',
  'While active, the item whispers all your darkest secrets into the minds of everyone in the room.',
  'Whenever it protects you, the nearest innocent person suffers half of the deflected injury.',
  'It cannot be put down or unequipped until it has claimed a life.',
];

// -------------------------------------------------------------
// 7. DIALOGUE HOOKS
// -------------------------------------------------------------
const DIALOGUE_SPARKS: GeneratedDialogue[] = [
  {
    speaker: 'A dying inquisitor',
    context: 'Handing over a bloodied signet ring on a freezing mountain pass',
    quote: '“Do not bring this to the council. Half of them are already wearing the black ribbon.”',
  },
  {
    speaker: 'A veteran mercenary captain',
    context: 'Examining the scorched ruins of a supposedly impenetrable vault',
    quote: '“Look at the blast marks on the threshold, kid. They didn’t blow the door inward. They blew it outward.”',
  },
  {
    speaker: 'A masked apothecary',
    context: 'Pouring clear liquid into a small cut-crystal phial',
    quote: '“This won’t stop the poison from killing you. It will just give you forty-eight hours to kill the man who gave it to you.”',
  },
  {
    speaker: 'The protagonist’s former mentor',
    context: 'Drawing their sword in the rain outside the city gates',
    quote: '“I taught you five ways to counter this stance. You forgot the sixth because I was saving it for tonight.”',
  },
  {
    speaker: 'A ship’s navigator',
    context: 'Staring down at a compass spinning erratically in the doldrums',
    quote: '“We haven’t moved in three days, Captain. But the stars overhead are completely different than they were an hour ago.”',
  },
  {
    speaker: 'An imprisoned rebel leader',
    context: 'Whispering through the iron grille of a subterranean cell',
    quote: '“They didn’t lock me in here to punish me. They locked me in here so they would know where I was when the sky falls.”',
  },
];

// -------------------------------------------------------------
// 8. MORAL DILEMMAS
// -------------------------------------------------------------
const DILEMMAS: GeneratedDilemma[] = [
  {
    title: 'The Floodgate Decision',
    situation: 'The reservoir dam is failing above the capital city. The emergency sluice gates can divert the torrent, but the bypass runs directly through the refugee settlement in the lower valley.',
    choiceA: 'Open the sluice: save 100,000 citizens in the high city, wiping out 2,000 defenseless refugees with no warning.',
    choiceB: 'Hold the gates: pray the masonry holds until dawn, risking catastrophic total breach that drowns the entire region.',
  },
  {
    title: 'The Inquisitor’s Vow',
    situation: 'You capture the spy carrying the antidote for the plague infecting your child. The spy refuses to talk unless granted immunity for the assassination of your beloved mentor.',
    choiceA: 'Sign the immunity pardon: your child lives, but your mentor’s cold-blooded killer walks free with full honor.',
    choiceB: 'Refuse to compromise justice: execute the spy, knowing the formula dies with them in three minutes.',
  },
  {
    title: 'The Deserter’s Beacon',
    situation: 'Your vanguard is surrounded on the frozen river. Lighting the signal beacon will bring imperial reinforcements to save them, but will alert the enemy artillery to the mountain path where 500 wounded civilians are escaping.',
    choiceA: 'Light the beacon: save your loyal soldiers at the cost of exposing the helpless caravan to mortar fire.',
    choiceB: 'Keep the beacon dark: protect the civilian column while listening to your soldiers fight to the last breath in the dark.',
  },
];

// =============================================================
// GENERATOR FUNCTIONS (Fresh Output Every Call)
// =============================================================

export function generateCharacter(genre: MuseGenre = 'fantasy'): GeneratedCharacter {
  const g = NAME_DATA[genre] || NAME_DATA.fantasy;
  const first = pick(g.first);
  const last = pick(g.last);
  const title = pick(g.titles);
  const archetype = pick(g.archetypes);
  
  return {
    name: `${first} ${last}`,
    epithet: title,
    archetype,
    role: archetype.split(' ')[0],
    wound: pick(WOUNDS),
    lie: pick(LIES),
    want: pick(WANTS),
    need: pick(NEEDS),
    quirk: pick(QUIRKS),
    signatureItem: pick(ITEMS),
  };
}

export function generateMonster(genre: MuseGenre = 'fantasy'): GeneratedMonster {
  const prefix = pick(MONSTER_PREFIXES);
  const base = pick(MONSTER_BASES);
  const dangerLevels = ['Lethal · Solo Apex', 'Elite Boss · Lair Master', 'Swarm Commander', 'Legendary World-Scourge'];

  return {
    name: `${prefix} ${base}`,
    nature: pick(MONSTER_NATURES),
    ability: pick(MONSTER_ABILITIES),
    lair: pick(MONSTER_LAIRS),
    weakness: pick(MONSTER_WEAKNESSES),
    tactic: 'Lures prey away from their companions before springing from high shadows or ambush crevices.',
    dangerLevel: pick(dangerLevels),
  };
}

export function generateHook(genre: MuseGenre = 'fantasy'): GeneratedHook {
  const titles = [
    'The Unkept Promise', 'The Reluctant Inheritance', 'The Broken Ward',
    'The Drowned Ledger', 'The False Truce', 'The Cinder Protocol',
    'The Iron Messenger', 'The Midnight Interrogation', 'The Last Scribe',
  ];

  return {
    title: pick(titles),
    incitingEvent: pick(HOOK_SUBJECTS),
    tickingClock: pick(HOOK_CATALYSTS),
    hiddenStakes: pick(HOOK_STAKES),
  };
}

export function generateTwist(genre: MuseGenre = 'fantasy'): GeneratedTwist {
  return pick(TWIST_TEMPLATES);
}

export function generatePlace(genre: MuseGenre = 'fantasy'): GeneratedPlace {
  const mod = pick(PLACE_MODIFIERS);
  const noun = pick(PLACE_NOUNS);
  const locale = pick(PLACE_LOCALES);

  return {
    name: `${mod} ${noun} ${locale}`,
    descriptor: `${mod} ${noun}`,
    feature: pick(PLACE_FEATURES),
    sensory: pick(PLACE_SENSORIES),
    hazard: pick(PLACE_HAZARDS),
  };
}

export function generateRelic(genre: MuseGenre = 'fantasy'): GeneratedRelic {
  return {
    name: pick(RELIC_NAMES),
    appearance: 'Carved from weathered whalebone and blackened cold iron, warm to the touch even in freezing rain.',
    power: pick(RELIC_POWERS),
    cost: pick(RELIC_COSTS),
  };
}

export function generateDilemma(): GeneratedDilemma {
  return pick(DILEMMAS);
}

export function generateDialogue(): GeneratedDialogue {
  return pick(DIALOGUE_SPARKS);
}

export function generateMasterScene(genre: MuseGenre = 'fantasy'): MasterSceneSpark {
  const char = generateCharacter(genre);
  const hook = generateHook(genre);
  const twist = generateTwist(genre);
  const place = generatePlace(genre);

  return {
    title: `${hook.title} at ${place.descriptor}`,
    protagonist: `${char.name}, ${char.epithet} (${char.archetype})`,
    catalyst: `${hook.incitingEvent}. ${hook.tickingClock}`,
    threat: `Takes place in ${place.name}, where ${place.feature}`,
    twist: twist.twist,
    stakes: hook.hiddenStakes,
  };
}
