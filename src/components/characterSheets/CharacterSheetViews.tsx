import React from 'react';
import {
  Plus,
  Trash2,
  Shield,
  Heart,
  Zap,
  Sword,
  Sparkles,
  Flame,
  Skull,
  Coins,
  Backpack,
  Activity,
  Award,
} from 'lucide-react';
import {
  AbilityScores,
  Dnd5eCharacterSheet,
  Dnd5eMonsterSheet,
  ShadowdarkCharacterSheet,
  ShadowdarkMonsterSheet,
  ValiantCharacterSheet,
  ValiantMonsterSheet,
  CustomSystemSheet,
  AttackEntry,
  TraitEntry,
} from '../../types';
import {
  get5eModifier,
  getShadowdarkModifier,
  formatModifier,
  DND5E_SKILLS,
} from '../../utils/sheetDefaults';

// -------------------------------------------------------------
// 1. D&D 5E Character Sheet View
// -------------------------------------------------------------
interface Dnd5eSheetViewProps {
  sheet: Dnd5eCharacterSheet;
  onChange: (updated: Dnd5eCharacterSheet) => void;
}

export const Dnd5eSheetView: React.FC<Dnd5eSheetViewProps> = ({ sheet, onChange }) => {
  const updateField = <K extends keyof Dnd5eCharacterSheet>(key: K, value: Dnd5eCharacterSheet[K]) => {
    onChange({ ...sheet, [key]: value });
  };

  const updateStat = (stat: keyof AbilityScores, val: number) => {
    const newStats = { ...sheet.stats, [stat]: Math.max(1, Math.min(30, val || 10)) };
    onChange({ ...sheet, stats: newStats });
  };

  const toggleSave = (stat: keyof AbilityScores) => {
    const updatedSaves = { ...sheet.savingThrows, [stat]: !sheet.savingThrows[stat] };
    onChange({ ...sheet, savingThrows: updatedSaves });
  };

  const toggleSkill = (skill: string) => {
    const updatedSkills = { ...sheet.skills, [skill]: !sheet.skills[skill] };
    onChange({ ...sheet, skills: updatedSkills });
  };

  const addAttack = () => {
    const newAtk: AttackEntry = {
      id: `atk-${Date.now()}`,
      name: 'New Attack',
      bonus: '+4',
      damage: '1d8+2',
      type: 'Slashing',
      range: '5 ft',
      notes: '',
    };
    updateField('attacks', [...(sheet.attacks || []), newAtk]);
  };

  const updateAttack = (id: string, updates: Partial<AttackEntry>) => {
    const updated = (sheet.attacks || []).map((a) => (a.id === id ? { ...a, ...updates } : a));
    updateField('attacks', updated);
  };

  const deleteAttack = (id: string) => {
    updateField('attacks', (sheet.attacks || []).filter((a) => a.id !== id));
  };

  const statsList: (keyof AbilityScores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--ink)' }}>
      {/* Character Identity Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
          background: 'var(--bg)',
          padding: '14px',
          borderRadius: '8px',
          border: '1px solid var(--line)',
        }}
      >
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
            Class & Level
          </label>
          <input
            type="text"
            value={sheet.classLevel}
            onChange={(e) => updateField('classLevel', e.target.value)}
            style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
            Race / Species
          </label>
          <input
            type="text"
            value={sheet.race}
            onChange={(e) => updateField('race', e.target.value)}
            style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
            Background
          </label>
          <input
            type="text"
            value={sheet.background}
            onChange={(e) => updateField('background', e.target.value)}
            style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
            Alignment
          </label>
          <input
            type="text"
            value={sheet.alignment}
            onChange={(e) => updateField('alignment', e.target.value)}
            style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
            Prof. Bonus
          </label>
          <input
            type="number"
            value={sheet.proficiencyBonus || 2}
            onChange={(e) => updateField('proficiencyBonus', parseInt(e.target.value, 10) || 2)}
            style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Ability Scores Row */}
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>
          Ability Scores & Saving Throws
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
          {statsList.map((stat) => {
            const score = sheet.stats[stat] || 10;
            const mod = get5eModifier(score);
            const isProf = !!sheet.savingThrows[stat];
            const saveMod = mod + (isProf ? sheet.proficiencyBonus || 2 : 0);

            return (
              <div
                key={stat}
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  padding: '10px 8px',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
                  {stat}
                </div>
                <div
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: mod >= 0 ? 'var(--accent)' : 'var(--crit)',
                    margin: '2px 0',
                  }}
                >
                  {formatModifier(mod)}
                </div>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => updateStat(stat, parseInt(e.target.value, 10))}
                  style={{
                    width: '46px',
                    textAlign: 'center',
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    padding: '2px 0',
                  }}
                />
                <div
                  onClick={() => toggleSave(stat)}
                  style={{
                    marginTop: '8px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    color: isProf ? 'var(--accent)' : 'var(--muted)',
                  }}
                  title="Toggle Saving Throw Proficiency"
                >
                  <input type="checkbox" checked={isProf} readOnly style={{ cursor: 'pointer' }} />
                  <span>Save: {formatModifier(saveMod)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Combat Vitals Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '12px',
          background: 'var(--bg)',
          padding: '16px',
          borderRadius: '10px',
          border: '1px solid var(--line)',
        }}
      >
        {/* AC */}
        <div style={{ textAlign: 'center', background: 'var(--panel)', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 700 }}>
            <Shield size={14} /> Armor Class
          </div>
          <input
            type="number"
            value={sheet.ac || 10}
            onChange={(e) => updateField('ac', parseInt(e.target.value, 10) || 10)}
            style={{ width: '60px', textAlign: 'center', fontSize: '1.4rem', fontWeight: 800, background: 'transparent', border: 'none', color: 'var(--ink)' }}
          />
        </div>

        {/* Initiative */}
        <div style={{ textAlign: 'center', background: 'var(--panel)', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#eab308', fontSize: '0.75rem', fontWeight: 700 }}>
            <Zap size={14} /> Initiative
          </div>
          <input
            type="number"
            value={sheet.initiative ?? get5eModifier(sheet.stats.dex)}
            onChange={(e) => updateField('initiative', parseInt(e.target.value, 10) || 0)}
            style={{ width: '60px', textAlign: 'center', fontSize: '1.4rem', fontWeight: 800, background: 'transparent', border: 'none', color: 'var(--ink)' }}
          />
        </div>

        {/* Speed */}
        <div style={{ textAlign: 'center', background: 'var(--panel)', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
            Speed
          </div>
          <input
            type="text"
            value={sheet.speed || '30 ft'}
            onChange={(e) => updateField('speed', e.target.value)}
            style={{ width: '100%', textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, background: 'transparent', border: 'none', color: 'var(--ink)' }}
          />
        </div>

        {/* HP Current / Max */}
        <div style={{ textAlign: 'center', background: 'var(--panel)', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#e11d48', fontSize: '0.75rem', fontWeight: 700 }}>
            <Heart size={14} /> Hit Points
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
            <input
              type="number"
              value={sheet.hpCurrent || 0}
              onChange={(e) => updateField('hpCurrent', parseInt(e.target.value, 10) || 0)}
              style={{ width: '45px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 800, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px' }}
              title="Current HP"
            />
            <span>/</span>
            <input
              type="number"
              value={sheet.hpMax || 10}
              onChange={(e) => updateField('hpMax', parseInt(e.target.value, 10) || 10)}
              style={{ width: '45px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 800, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px' }}
              title="Max HP"
            />
          </div>
        </div>

        {/* Hit Dice */}
        <div style={{ textAlign: 'center', background: 'var(--panel)', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
            Hit Dice
          </div>
          <input
            type="text"
            value={sheet.hitDice || '1d10'}
            onChange={(e) => updateField('hitDice', e.target.value)}
            style={{ width: '100%', textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, background: 'transparent', border: 'none', color: 'var(--ink)' }}
          />
        </div>

        {/* Death Saves */}
        <div style={{ textAlign: 'center', background: 'var(--panel)', padding: '8px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Death Saves
          </div>
          <div style={{ fontSize: '0.72rem', display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
            <span>Success:</span>
            <span>{[1, 2, 3].map((i) => (
              <input
                key={i}
                type="checkbox"
                checked={(sheet.deathSaves?.successes || 0) >= i}
                onChange={() => {
                  const curr = sheet.deathSaves?.successes || 0;
                  const next = curr === i ? i - 1 : i;
                  updateField('deathSaves', { ...(sheet.deathSaves || { failures: 0 }), successes: next });
                }}
                style={{ marginLeft: '2px', cursor: 'pointer' }}
              />
            ))}</span>
          </div>
          <div style={{ fontSize: '0.72rem', display: 'flex', justifyContent: 'space-between', padding: '0 4px', marginTop: '2px' }}>
            <span>Failure:</span>
            <span>{[1, 2, 3].map((i) => (
              <input
                key={i}
                type="checkbox"
                checked={(sheet.deathSaves?.failures || 0) >= i}
                onChange={() => {
                  const curr = sheet.deathSaves?.failures || 0;
                  const next = curr === i ? i - 1 : i;
                  updateField('deathSaves', { ...(sheet.deathSaves || { successes: 0 }), failures: next });
                }}
                style={{ marginLeft: '2px', cursor: 'pointer' }}
              />
            ))}</span>
          </div>
        </div>
      </div>

      {/* Skills & Attacks Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px' }}>
        {/* Skills Column */}
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
            Skills
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {DND5E_SKILLS.map(({ name, stat }) => {
              const isProf = !!sheet.skills[name];
              const baseMod = get5eModifier(sheet.stats[stat as keyof AbilityScores] || 10);
              const totalMod = baseMod + (isProf ? sheet.proficiencyBonus || 2 : 0);

              return (
                <div
                  key={name}
                  onClick={() => toggleSkill(name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    background: isProf ? 'var(--accent-soft)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="checkbox" checked={isProf} readOnly style={{ cursor: 'pointer' }} />
                    <span style={{ fontWeight: isProf ? 700 : 400 }}>{name}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase' }}>
                      ({stat})
                    </span>
                  </div>
                  <span style={{ fontWeight: 700, color: totalMod >= 0 ? 'var(--accent)' : 'var(--crit)' }}>
                    {formatModifier(totalMod)}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--line)', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted)' }}>Passive Perception:</span>
            <span style={{ fontWeight: 700 }}>
              {10 + get5eModifier(sheet.stats.wis) + (sheet.skills.Perception ? sheet.proficiencyBonus || 2 : 0)}
            </span>
          </div>
        </div>

        {/* Attacks, Equipment & Spells */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Attacks Table */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sword size={14} /> Attacks & Weapon Actions
              </span>
              <button className="action-btn-secondary" onClick={addAttack} style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                <Plus size={11} /> Add Attack
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(sheet.attacks || []).map((atk) => (
                <div
                  key={atk.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 80px 100px 1fr 28px',
                    gap: '8px',
                    alignItems: 'center',
                    background: 'var(--bg)',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid var(--line)',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Weapon / Spell"
                    value={atk.name}
                    onChange={(e) => updateAttack(atk.id, { name: e.target.value })}
                    style={{ background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.85rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Bonus"
                    value={atk.bonus}
                    onChange={(e) => updateAttack(atk.id, { bonus: e.target.value })}
                    style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px', padding: '2px 6px', fontSize: '0.82rem', textAlign: 'center' }}
                  />
                  <input
                    type="text"
                    placeholder="Damage/Type"
                    value={atk.damage}
                    onChange={(e) => updateAttack(atk.id, { damage: e.target.value })}
                    style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px', padding: '2px 6px', fontSize: '0.82rem', textAlign: 'center' }}
                  />
                  <input
                    type="text"
                    placeholder="Notes (Range, Properties)"
                    value={atk.notes || ''}
                    onChange={(e) => updateAttack(atk.id, { notes: e.target.value })}
                    style={{ background: 'transparent', border: 'none', fontSize: '0.78rem', color: 'var(--muted)' }}
                  />
                  <button
                    className="icon-btn"
                    onClick={() => deleteAttack(atk.id)}
                    style={{ color: 'var(--crit)', padding: '4px' }}
                    title="Delete attack"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Features, Traits & Feats */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', padding: '14px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
              Features, Traits & Special Abilities
            </span>
            <textarea
              rows={4}
              value={sheet.featuresTraits || ''}
              onChange={(e) => updateField('featuresTraits', e.target.value)}
              placeholder="Class abilities, racial traits, feats, resistances..."
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                padding: '8px',
                fontSize: '0.84rem',
                lineHeight: 1.5,
                color: 'var(--ink)',
              }}
            />
          </div>

          {/* Equipment & Currency */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Backpack size={14} /> Equipment & Coin Pouch
              </span>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem' }}>
                <span>GP: <b>{sheet.currency?.gp || 0}</b></span>
                <span>SP: <b>{sheet.currency?.sp || 0}</b></span>
              </div>
            </div>
            <textarea
              rows={3}
              value={sheet.equipment || ''}
              onChange={(e) => updateField('equipment', e.target.value)}
              placeholder="Armor, weapons, magic items, adventuring gear..."
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                padding: '8px',
                fontSize: '0.84rem',
                color: 'var(--ink)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. D&D 5E Monster / Stat Block View
// -------------------------------------------------------------
interface Dnd5eMonsterViewProps {
  sheet: Dnd5eMonsterSheet;
  onChange: (updated: Dnd5eMonsterSheet) => void;
}

export const Dnd5eMonsterView: React.FC<Dnd5eMonsterViewProps> = ({ sheet, onChange }) => {
  const updateField = <K extends keyof Dnd5eMonsterSheet>(key: K, value: Dnd5eMonsterSheet[K]) => {
    onChange({ ...sheet, [key]: value });
  };

  const updateStat = (stat: keyof AbilityScores, val: number) => {
    onChange({ ...sheet, stats: { ...sheet.stats, [stat]: Math.max(1, val || 10) } });
  };

  const addAction = (category: 'traits' | 'actions' | 'reactions' | 'legendaryActions') => {
    const newEntry: TraitEntry = {
      id: `act-${Date.now()}`,
      name: category === 'traits' ? 'New Trait' : 'New Action',
      description: 'Describe reach, to-hit modifier, and damage formula...',
    };
    updateField(category, [...(sheet[category] || []), newEntry]);
  };

  const updateAction = (category: 'traits' | 'actions' | 'reactions' | 'legendaryActions', id: string, updates: Partial<TraitEntry>) => {
    const list = (sheet[category] || []).map((item) => (item.id === id ? { ...item, ...updates } : item));
    updateField(category, list);
  };

  const deleteAction = (category: 'traits' | 'actions' | 'reactions' | 'legendaryActions', id: string) => {
    updateField(category, (sheet[category] || []).filter((item) => item.id !== id));
  };

  const statsList: (keyof AbilityScores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  return (
    <div
      style={{
        background: 'var(--panel)',
        border: '2px solid #991b1b',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        color: 'var(--ink)',
      }}
    >
      {/* Monster Header */}
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#991b1b' }}>Size</label>
            <input
              type="text"
              value={sheet.size}
              onChange={(e) => updateField('size', e.target.value)}
              placeholder="Medium, Large, etc."
              style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#991b1b' }}>Type</label>
            <input
              type="text"
              value={sheet.type}
              onChange={(e) => updateField('type', e.target.value)}
              placeholder="Beast, Fiend, Undead..."
              style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#991b1b' }}>Alignment</label>
            <input
              type="text"
              value={sheet.alignment}
              onChange={(e) => updateField('alignment', e.target.value)}
              placeholder="Chaotic Evil, etc."
              style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      <div style={{ height: '2px', background: '#991b1b', margin: '4px 0' }} />

      {/* Core Vitals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
            Armor Class (AC)
          </label>
          <input
            type="text"
            value={sheet.ac}
            onChange={(e) => updateField('ac', e.target.value)}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '5px 8px', fontSize: '0.9rem', fontWeight: 700 }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
            Hit Points (HP)
          </label>
          <input
            type="text"
            value={sheet.hp}
            onChange={(e) => updateField('hp', e.target.value)}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '5px 8px', fontSize: '0.9rem', fontWeight: 700 }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
            Speed
          </label>
          <input
            type="text"
            value={sheet.speed}
            onChange={(e) => updateField('speed', e.target.value)}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '5px 8px', fontSize: '0.9rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
            CR (Challenge Rating)
          </label>
          <input
            type="text"
            value={sheet.cr}
            onChange={(e) => updateField('cr', e.target.value)}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '5px 8px', fontSize: '0.9rem', fontWeight: 700, color: '#991b1b' }}
          />
        </div>
      </div>

      <div style={{ height: '2px', background: '#991b1b', margin: '4px 0' }} />

      {/* Ability Scores Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', textAlign: 'center' }}>
        {statsList.map((stat) => {
          const score = sheet.stats[stat] || 10;
          const mod = get5eModifier(score);
          return (
            <div key={stat} style={{ background: 'var(--bg)', padding: '6px', borderRadius: '6px', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
                {stat}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0' }}>
                {formatModifier(mod)}
              </div>
              <input
                type="number"
                value={score}
                onChange={(e) => updateStat(stat, parseInt(e.target.value, 10))}
                style={{ width: '42px', textAlign: 'center', fontSize: '0.8rem', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px' }}
              />
            </div>
          );
        })}
      </div>

      <div style={{ height: '2px', background: '#991b1b', margin: '4px 0' }} />

      {/* Senses, Immunities, Languages */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem' }}>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
            Damage Resistances / Immunities
          </label>
          <input
            type="text"
            value={sheet.resistances || ''}
            onChange={(e) => updateField('resistances', e.target.value)}
            placeholder="Fire, poison, nonmagical physical..."
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.82rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
            Senses & Languages
          </label>
          <input
            type="text"
            value={sheet.senses || ''}
            onChange={(e) => updateField('senses', e.target.value)}
            placeholder="Darkvision 60 ft., Common, Draconic..."
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* Traits Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#991b1b' }}>
            Special Traits
          </span>
          <button className="action-btn-secondary" onClick={() => addAction('traits')} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
            <Plus size={11} /> Add Trait
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(sheet.traits || []).map((t) => (
            <div key={t.id} style={{ background: 'var(--bg)', padding: '10px', borderRadius: '6px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <input
                  type="text"
                  value={t.name}
                  onChange={(e) => updateAction('traits', t.id, { name: e.target.value })}
                  style={{ fontWeight: 700, fontSize: '0.88rem', background: 'transparent', border: 'none', color: '#991b1b' }}
                />
                <button className="icon-btn" onClick={() => deleteAction('traits', t.id)} style={{ color: 'var(--crit)' }}>
                  <Trash2 size={13} />
                </button>
              </div>
              <textarea
                rows={2}
                value={t.description}
                onChange={(e) => updateAction('traits', t.id, { description: e.target.value })}
                style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.82rem', resize: 'vertical' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#991b1b' }}>
            Actions & Attacks
          </span>
          <button className="action-btn-secondary" onClick={() => addAction('actions')} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
            <Plus size={11} /> Add Action
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(sheet.actions || []).map((act) => (
            <div key={act.id} style={{ background: 'var(--bg)', padding: '10px', borderRadius: '6px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <input
                  type="text"
                  value={act.name}
                  onChange={(e) => updateAction('actions', act.id, { name: e.target.value })}
                  style={{ fontWeight: 700, fontSize: '0.88rem', background: 'transparent', border: 'none', color: '#991b1b' }}
                />
                <button className="icon-btn" onClick={() => deleteAction('actions', act.id)} style={{ color: 'var(--crit)' }}>
                  <Trash2 size={13} />
                </button>
              </div>
              <textarea
                rows={2}
                value={act.description}
                onChange={(e) => updateAction('actions', act.id, { description: e.target.value })}
                style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.82rem', resize: 'vertical' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. ShadowDark Character Sheet View
// -------------------------------------------------------------
interface ShadowdarkSheetViewProps {
  sheet: ShadowdarkCharacterSheet;
  onChange: (updated: ShadowdarkCharacterSheet) => void;
}

export const ShadowdarkSheetView: React.FC<ShadowdarkSheetViewProps> = ({ sheet, onChange }) => {
  const updateField = <K extends keyof ShadowdarkCharacterSheet>(key: K, value: ShadowdarkCharacterSheet[K]) => {
    onChange({ ...sheet, [key]: value });
  };

  const updateStat = (stat: keyof AbilityScores, val: number) => {
    onChange({ ...sheet, stats: { ...sheet.stats, [stat]: Math.max(1, val || 10) } });
  };

  const addGearItem = () => {
    const newItem = { id: `gear-${Date.now()}`, name: 'New Item', slots: 1 };
    updateField('gearSlots', [...(sheet.gearSlots || []), newItem]);
  };

  const updateGearItem = (id: string, updates: Partial<{ name: string; slots: number; torchHours?: number }>) => {
    const updated = (sheet.gearSlots || []).map((g) => (g.id === id ? { ...g, ...updates } : g));
    updateField('gearSlots', updated);
  };

  const deleteGearItem = (id: string) => {
    updateField('gearSlots', (sheet.gearSlots || []).filter((g) => g.id !== id));
  };

  const statsList: (keyof AbilityScores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  const totalSlotsUsed = (sheet.gearSlots || []).reduce((acc, g) => acc + (g.slots || 1), 0);
  const maxSlotsAllowed = sheet.maxSlots || (10 + getShadowdarkModifier(sheet.stats.con));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--ink)' }}>
      {/* ShadowDark Header Card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          background: 'var(--panel)',
          padding: '16px',
          borderRadius: '8px',
          border: '2px solid #292524',
        }}
      >
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>Class</label>
          <input
            type="text"
            value={sheet.characterClass}
            onChange={(e) => updateField('characterClass', e.target.value)}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>Ancestry</label>
          <input
            type="text"
            value={sheet.ancestry}
            onChange={(e) => updateField('ancestry', e.target.value)}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>Level</label>
          <input
            type="number"
            value={sheet.level}
            onChange={(e) => updateField('level', parseInt(e.target.value, 10) || 1)}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem', fontWeight: 700 }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>Alignment</label>
          <select
            value={sheet.alignment}
            onChange={(e) => updateField('alignment', e.target.value as any)}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
          >
            <option value="Lawful">Lawful</option>
            <option value="Neutral">Neutral</option>
            <option value="Chaotic">Chaotic</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>Deity / Title</label>
          <input
            type="text"
            value={sheet.deity}
            onChange={(e) => updateField('deity', e.target.value)}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* ShadowDark Ability Scores (3d6 rules with OSR modifiers) */}
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>
          ShadowDark Stats & Modifiers
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
          {statsList.map((stat) => {
            const score = sheet.stats[stat] || 10;
            const mod = getShadowdarkModifier(score);

            return (
              <div
                key={stat}
                style={{
                  background: 'var(--panel)',
                  border: '1px solid #44403c',
                  borderRadius: '8px',
                  padding: '12px 6px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
                  {stat}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: mod >= 0 ? '#10b981' : '#f43f5e', margin: '4px 0' }}>
                  {formatModifier(mod)}
                </div>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => updateStat(stat, parseInt(e.target.value, 10))}
                  style={{ width: '45px', textAlign: 'center', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '0.82rem' }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ShadowDark Vitals Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div style={{ textAlign: 'center', background: 'var(--bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>Armor Class</div>
          <input
            type="number"
            value={sheet.ac}
            onChange={(e) => updateField('ac', parseInt(e.target.value, 10) || 10)}
            style={{ width: '60px', textAlign: 'center', fontSize: '1.4rem', fontWeight: 800, background: 'transparent', border: 'none' }}
          />
        </div>
        <div style={{ textAlign: 'center', background: 'var(--bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>Hit Points</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '2px' }}>
            <input
              type="number"
              value={sheet.hpCurrent}
              onChange={(e) => updateField('hpCurrent', parseInt(e.target.value, 10) || 0)}
              style={{ width: '45px', textAlign: 'center', fontSize: '1.3rem', fontWeight: 800, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px' }}
            />
            <span style={{ fontSize: '1.3rem' }}>/</span>
            <input
              type="number"
              value={sheet.hpMax}
              onChange={(e) => updateField('hpMax', parseInt(e.target.value, 10) || 1)}
              style={{ width: '45px', textAlign: 'center', fontSize: '1.3rem', fontWeight: 800, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px' }}
            />
          </div>
        </div>
        <div style={{ textAlign: 'center', background: 'var(--bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>Speed</div>
          <input
            type="text"
            value={sheet.speed || 'Near'}
            onChange={(e) => updateField('speed', e.target.value)}
            style={{ width: '100%', textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, background: 'transparent', border: 'none' }}
          />
        </div>
        <div style={{ textAlign: 'center', background: 'var(--bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#eab308' }}>Gold (GP)</div>
          <input
            type="number"
            value={sheet.gold || 0}
            onChange={(e) => updateField('gold', parseInt(e.target.value, 10) || 0)}
            style={{ width: '80px', textAlign: 'center', fontSize: '1.3rem', fontWeight: 800, background: 'transparent', border: 'none', color: '#eab308' }}
          />
        </div>
      </div>

      {/* ShadowDark Inventory / Gear Slots (Famous slot system!) */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Backpack size={15} /> Gear Slots ({totalSlotsUsed} / {maxSlotsAllowed} Slots Used)
            </span>
            {totalSlotsUsed > maxSlotsAllowed && (
              <span style={{ fontSize: '0.72rem', color: 'var(--crit)', fontWeight: 700 }}>
                ⚠️ Encumbered! Movement is Close only.
              </span>
            )}
          </div>
          <button className="action-btn-secondary" onClick={addGearItem} style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
            <Plus size={12} /> Add Gear
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
          {(sheet.gearSlots || []).map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: 'var(--bg)',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                gap: '8px',
              }}
            >
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateGearItem(item.id, { name: e.target.value })}
                style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '0.82rem', fontWeight: 500 }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Slots:</span>
              <input
                type="number"
                value={item.slots || 1}
                onChange={(e) => updateGearItem(item.id, { slots: parseInt(e.target.value, 10) || 1 })}
                style={{ width: '36px', textAlign: 'center', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '0.8rem' }}
              />
              <button className="icon-btn" onClick={() => deleteGearItem(item.id)} style={{ color: 'var(--crit)', padding: '2px' }}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Talents & Spells */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', padding: '14px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
            Class Talents & Abilities
          </span>
          <textarea
            rows={4}
            value={sheet.talents || ''}
            onChange={(e) => updateField('talents', e.target.value)}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '6px', padding: '8px', fontSize: '0.82rem' }}
          />
        </div>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', padding: '14px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
            Known Spells (Tier 1–5)
          </span>
          <textarea
            rows={4}
            value={sheet.spells || ''}
            onChange={(e) => updateField('spells', e.target.value)}
            placeholder="Spell name, Tier, Spell Check DC..."
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '6px', padding: '8px', fontSize: '0.82rem' }}
          />
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. ShadowDark Monster / Adversary View
// -------------------------------------------------------------
interface ShadowdarkMonsterViewProps {
  sheet: ShadowdarkMonsterSheet;
  onChange: (updated: ShadowdarkMonsterSheet) => void;
}

export const ShadowdarkMonsterView: React.FC<ShadowdarkMonsterViewProps> = ({ sheet, onChange }) => {
  const updateField = <K extends keyof ShadowdarkMonsterSheet>(key: K, value: ShadowdarkMonsterSheet[K]) => {
    onChange({ ...sheet, [key]: value });
  };

  const updateStat = (stat: keyof AbilityScores, val: number) => {
    onChange({ ...sheet, stats: { ...sheet.stats, [stat]: Math.max(1, val || 10) } });
  };

  const statsList: (keyof AbilityScores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  return (
    <div
      style={{
        background: '#1c1917',
        color: '#f5f5f4',
        border: '2px solid #78716c',
        borderRadius: '8px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #44403c', paddingBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase' }}>
            ShadowDark Monster Block
          </span>
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <span style={{ fontSize: '0.82rem', color: '#d6d3d1' }}>Level (LV):</span>
            <input
              type="number"
              value={sheet.level}
              onChange={(e) => updateField('level', parseInt(e.target.value, 10) || 1)}
              style={{ width: '45px', textAlign: 'center', background: '#292524', border: '1px solid #57534e', color: '#fff', borderRadius: '4px' }}
            />
            <span style={{ fontSize: '0.82rem', color: '#d6d3d1', marginLeft: '8px' }}>Alignment:</span>
            <select
              value={sheet.alignment}
              onChange={(e) => updateField('alignment', e.target.value as any)}
              style={{ background: '#292524', border: '1px solid #57534e', color: '#fff', borderRadius: '4px', fontSize: '0.82rem' }}
            >
              <option value="Lawful">L (Lawful)</option>
              <option value="Neutral">N (Neutral)</option>
              <option value="Chaotic">C (Chaotic)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', textAlign: 'center' }}>
          <div style={{ background: '#292524', padding: '6px 12px', borderRadius: '6px', border: '1px solid #44403c' }}>
            <div style={{ fontSize: '0.68rem', color: '#a8a29e', fontWeight: 700 }}>AC</div>
            <input
              type="number"
              value={sheet.ac}
              onChange={(e) => updateField('ac', parseInt(e.target.value, 10) || 10)}
              style={{ width: '45px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 800, background: 'transparent', border: 'none', color: '#fff' }}
            />
          </div>
          <div style={{ background: '#292524', padding: '6px 12px', borderRadius: '6px', border: '1px solid #44403c' }}>
            <div style={{ fontSize: '0.68rem', color: '#a8a29e', fontWeight: 700 }}>HP</div>
            <input
              type="text"
              value={sheet.hp}
              onChange={(e) => updateField('hp', e.target.value)}
              style={{ width: '50px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 800, background: 'transparent', border: 'none', color: '#ef4444' }}
            />
          </div>
          <div style={{ background: '#292524', padding: '6px 12px', borderRadius: '6px', border: '1px solid #44403c' }}>
            <div style={{ fontSize: '0.68rem', color: '#a8a29e', fontWeight: 700 }}>Move</div>
            <input
              type="text"
              value={sheet.movement}
              onChange={(e) => updateField('movement', e.target.value)}
              style={{ width: '60px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, background: 'transparent', border: 'none', color: '#38bdf8' }}
            />
          </div>
        </div>
      </div>

      {/* Attacks string */}
      <div>
        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>
          Attacks
        </label>
        <input
          type="text"
          value={sheet.attacks}
          onChange={(e) => updateField('attacks', e.target.value)}
          placeholder="e.g. 2 claws +3 (1d6) and 1 bite +3 (1d8 + poison)"
          style={{ width: '100%', background: '#292524', border: '1px solid #44403c', borderRadius: '4px', padding: '8px', color: '#fff', fontSize: '0.9rem', marginTop: '4px' }}
        />
      </div>

      {/* Stat Modifiers */}
      <div>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase' }}>
          Stat Modifiers
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', marginTop: '4px' }}>
          {statsList.map((stat) => {
            const score = sheet.stats[stat] || 10;
            const mod = getShadowdarkModifier(score);
            return (
              <div key={stat} style={{ background: '#292524', padding: '4px', textAlign: 'center', borderRadius: '4px', border: '1px solid #44403c' }}>
                <span style={{ fontSize: '0.65rem', color: '#a8a29e', textTransform: 'uppercase', display: 'block' }}>{stat}</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: mod >= 0 ? '#10b981' : '#f43f5e' }}>{formatModifier(mod)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Specials & Dark Lore */}
      <div>
        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>
          Specials & Lore
        </label>
        <textarea
          rows={3}
          value={sheet.specials}
          onChange={(e) => updateField('specials', e.target.value)}
          placeholder="Darkvision. Undead. Surprises on 1-2 on d6..."
          style={{ width: '100%', background: '#292524', border: '1px solid #44403c', borderRadius: '4px', padding: '8px', color: '#fff', fontSize: '0.85rem', marginTop: '4px' }}
        />
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 5. Tales of the Valiant (TotV) Character Sheet View
// -------------------------------------------------------------
interface ValiantSheetViewProps {
  sheet: ValiantCharacterSheet;
  onChange: (updated: ValiantCharacterSheet) => void;
}

export const ValiantSheetView: React.FC<ValiantSheetViewProps> = ({ sheet, onChange }) => {
  const updateField = <K extends keyof ValiantCharacterSheet>(key: K, value: ValiantCharacterSheet[K]) => {
    onChange({ ...sheet, [key]: value });
  };

  const updateStat = (stat: keyof AbilityScores, val: number) => {
    onChange({ ...sheet, stats: { ...sheet.stats, [stat]: Math.max(1, val || 10) } });
  };

  const statsList: (keyof AbilityScores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--ink)' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          background: 'var(--bg)',
          padding: '14px',
          borderRadius: '8px',
          border: '1px solid var(--line)',
        }}
      >
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>Class & Level</label>
          <input
            type="text"
            value={sheet.classLevel}
            onChange={(e) => updateField('classLevel', e.target.value)}
            style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>Lineage</label>
          <input
            type="text"
            value={sheet.lineage}
            onChange={(e) => updateField('lineage', e.target.value)}
            placeholder="Human, Dwarf, Elf..."
            style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>Heritage</label>
          <input
            type="text"
            value={sheet.heritage}
            onChange={(e) => updateField('heritage', e.target.value)}
            placeholder="Fire-Touched, Stone..."
            style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>Background</label>
          <input
            type="text"
            value={sheet.background}
            onChange={(e) => updateField('background', e.target.value)}
            style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Ability Scores */}
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>
          Attributes (Black Flag Engine)
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
          {statsList.map((stat) => {
            const score = sheet.stats[stat] || 10;
            const mod = get5eModifier(score);
            return (
              <div key={stat} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', padding: '10px 6px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>{stat}</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)', margin: '2px 0' }}>{formatModifier(mod)}</div>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => updateStat(stat, parseInt(e.target.value, 10))}
                  style={{ width: '42px', textAlign: 'center', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '0.82rem' }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Vitals + Signature Luck Points Tracker! */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px' }}>
        <div style={{ textAlign: 'center', background: 'var(--panel)', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>AC</span>
          <input
            type="number"
            value={sheet.ac}
            onChange={(e) => updateField('ac', parseInt(e.target.value, 10) || 10)}
            style={{ width: '50px', textAlign: 'center', fontSize: '1.3rem', fontWeight: 800, background: 'transparent', border: 'none' }}
          />
        </div>
        <div style={{ textAlign: 'center', background: 'var(--panel)', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>HP</span>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
            <input
              type="number"
              value={sheet.hpCurrent}
              onChange={(e) => updateField('hpCurrent', parseInt(e.target.value, 10) || 0)}
              style={{ width: '42px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 800, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px' }}
            />
            <span>/</span>
            <input
              type="number"
              value={sheet.hpMax}
              onChange={(e) => updateField('hpMax', parseInt(e.target.value, 10) || 1)}
              style={{ width: '42px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 800, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px' }}
            />
          </div>
        </div>

        {/* Tales of the Valiant Signature Luck Pool */}
        <div style={{ textAlign: 'center', background: 'var(--accent-soft)', padding: '10px', borderRadius: '8px', border: '1px solid var(--accent)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Sparkles size={13} /> Luck Points
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
            {[1, 2, 3, 4, 5].map((pt) => (
              <div
                key={pt}
                onClick={() => {
                  const curr = sheet.luckCurrent || 0;
                  updateField('luckCurrent', curr === pt ? pt - 1 : pt);
                }}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: (sheet.luckCurrent || 0) >= pt ? 'var(--accent)' : 'var(--bg)',
                  border: '1.5px solid var(--accent)',
                  cursor: 'pointer',
                }}
                title={`Luck Point ${pt}`}
              />
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', background: 'var(--panel)', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>Speed</span>
          <input
            type="text"
            value={sheet.speed}
            onChange={(e) => updateField('speed', e.target.value)}
            style={{ width: '100%', textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, background: 'transparent', border: 'none' }}
          />
        </div>
      </div>

      {/* Talents, Spells, Equipment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', padding: '14px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
            Talents (Technical, Martial, Magic)
          </span>
          <textarea
            rows={4}
            value={sheet.talents || ''}
            onChange={(e) => updateField('talents', e.target.value)}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '6px', padding: '8px', fontSize: '0.82rem' }}
          />
        </div>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', padding: '14px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
            Equipment & Lineage Traits
          </span>
          <textarea
            rows={4}
            value={sheet.equipment || ''}
            onChange={(e) => updateField('equipment', e.target.value)}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '6px', padding: '8px', fontSize: '0.82rem' }}
          />
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 6. Tales of the Valiant (TotV) Monster View
// -------------------------------------------------------------
interface ValiantMonsterViewProps {
  sheet: ValiantMonsterSheet;
  onChange: (updated: ValiantMonsterSheet) => void;
}

export const ValiantMonsterView: React.FC<ValiantMonsterViewProps> = ({ sheet, onChange }) => {
  const updateField = <K extends keyof ValiantMonsterSheet>(key: K, value: ValiantMonsterSheet[K]) => {
    onChange({ ...sheet, [key]: value });
  };

  const updateStat = (stat: keyof AbilityScores, val: number) => {
    onChange({ ...sheet, stats: { ...sheet.stats, [stat]: Math.max(1, val || 10) } });
  };

  const addAction = (category: 'traits' | 'actions' | 'reactions') => {
    const newEntry: TraitEntry = {
      id: `act-${Date.now()}`,
      name: category === 'traits' ? 'New Trait' : 'New Action',
      description: 'Describe details and damage...',
    };
    updateField(category, [...(sheet[category] || []), newEntry]);
  };

  const updateAction = (category: 'traits' | 'actions' | 'reactions', id: string, updates: Partial<TraitEntry>) => {
    const list = (sheet[category] || []).map((item) => (item.id === id ? { ...item, ...updates } : item));
    updateField(category, list);
  };

  const deleteAction = (category: 'traits' | 'actions' | 'reactions', id: string) => {
    updateField(category, (sheet[category] || []).filter((item) => item.id !== id));
  };

  const statsList: (keyof AbilityScores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  return (
    <div
      style={{
        background: 'var(--panel)',
        border: '2px solid #854d0e',
        borderRadius: '8px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#854d0e' }}>Type</label>
          <input
            type="text"
            value={sheet.creatureType}
            onChange={(e) => updateField('creatureType', e.target.value)}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#854d0e' }}>CR</label>
          <input
            type="text"
            value={sheet.cr}
            onChange={(e) => updateField('cr', e.target.value)}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem', fontWeight: 700 }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#854d0e' }}>AC</label>
          <input
            type="text"
            value={sheet.ac}
            onChange={(e) => updateField('ac', e.target.value)}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#854d0e' }}>HP</label>
          <input
            type="text"
            value={sheet.hp}
            onChange={(e) => updateField('hp', e.target.value)}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Doom Points (GM Adversary mechanic in Tales of the Valiant) */}
      <div style={{ background: '#78350f', color: '#fef3c7', padding: '10px 14px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.84rem' }}>
          <Skull size={15} /> Doom Points Pool
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[1, 2, 3, 4, 5].map((p) => (
            <div
              key={p}
              onClick={() => updateField('doomPoints', sheet.doomPoints === p ? p - 1 : p)}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: sheet.doomPoints >= p ? '#fef3c7' : '#451a03',
                border: '1.5px solid #fef3c7',
                cursor: 'pointer',
              }}
              title={`Doom Token ${p}`}
            />
          ))}
        </div>
      </div>

      {/* Attributes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', textAlign: 'center' }}>
        {statsList.map((stat) => {
          const score = sheet.stats[stat] || 10;
          const mod = get5eModifier(score);
          return (
            <div key={stat} style={{ background: 'var(--bg)', padding: '6px', borderRadius: '6px', border: '1px solid var(--line)' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>{stat}</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{formatModifier(mod)}</div>
              <input
                type="number"
                value={score}
                onChange={(e) => updateStat(stat, parseInt(e.target.value, 10))}
                style={{ width: '40px', textAlign: 'center', fontSize: '0.8rem', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px' }}
              />
            </div>
          );
        })}
      </div>

      {/* Traits & Actions */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#854d0e' }}>Actions</span>
          <button className="action-btn-secondary" onClick={() => addAction('actions')} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
            <Plus size={11} /> Add Action
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(sheet.actions || []).map((act) => (
            <div key={act.id} style={{ background: 'var(--bg)', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <input
                  type="text"
                  value={act.name}
                  onChange={(e) => updateAction('actions', act.id, { name: e.target.value })}
                  style={{ fontWeight: 700, fontSize: '0.85rem', background: 'transparent', border: 'none', color: '#854d0e' }}
                />
                <button className="icon-btn" onClick={() => deleteAction('actions', act.id)} style={{ color: 'var(--crit)' }}>
                  <Trash2 size={12} />
                </button>
              </div>
              <textarea
                rows={2}
                value={act.description}
                onChange={(e) => updateAction('actions', act.id, { description: e.target.value })}
                style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.82rem' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 7. Custom System Character & Monster Sheet View
// -------------------------------------------------------------
interface CustomSystemSheetViewProps {
  sheet: CustomSystemSheet;
  onChange: (updated: CustomSystemSheet) => void;
}

export const CustomSystemSheetView: React.FC<CustomSystemSheetViewProps> = ({ sheet, onChange }) => {
  const updateField = <K extends keyof CustomSystemSheet>(key: K, value: CustomSystemSheet[K]) => {
    onChange({ ...sheet, [key]: value });
  };

  const addAttribute = () => {
    const newAttr = { id: `attr-${Date.now()}`, name: 'New Attribute', value: '10' };
    updateField('attributes', [...(sheet.attributes || []), newAttr]);
  };

  const updateAttribute = (id: string, updates: Partial<{ name: string; value: string }>) => {
    const list = (sheet.attributes || []).map((a) => (a.id === id ? { ...a, ...updates } : a));
    updateField('attributes', list);
  };

  const deleteAttribute = (id: string) => {
    updateField('attributes', (sheet.attributes || []).filter((a) => a.id !== id));
  };

  const addPool = () => {
    const newPool = { id: `pool-${Date.now()}`, name: 'Energy / Health', current: 10, max: 10 };
    updateField('resourcePools', [...(sheet.resourcePools || []), newPool]);
  };

  const updatePool = (id: string, updates: Partial<{ name: string; current: number; max: number }>) => {
    const list = (sheet.resourcePools || []).map((p) => (p.id === id ? { ...p, ...updates } : p));
    updateField('resourcePools', list);
  };

  const deletePool = (id: string) => {
    updateField('resourcePools', (sheet.resourcePools || []).filter((p) => p.id !== id));
  };

  const addSkill = () => {
    const newSkill = { id: `sk-${Date.now()}`, name: 'New Skill', value: '+2' };
    updateField('skills', [...(sheet.skills || []), newSkill]);
  };

  const updateSkill = (id: string, updates: Partial<{ name: string; value: string }>) => {
    const list = (sheet.skills || []).map((s) => (s.id === id ? { ...s, ...updates } : s));
    updateField('skills', list);
  };

  const deleteSkill = (id: string) => {
    updateField('skills', (sheet.skills || []).filter((s) => s.id !== id));
  };

  const addAttack = () => {
    const newAtk: AttackEntry = {
      id: `atk-${Date.now()}`,
      name: 'Custom Weapon / Power',
      bonus: '+3',
      damage: '2d6',
      notes: '',
    };
    updateField('attacks', [...(sheet.attacks || []), newAtk]);
  };

  const updateAttack = (id: string, updates: Partial<AttackEntry>) => {
    const list = (sheet.attacks || []).map((a) => (a.id === id ? { ...a, ...updates } : a));
    updateField('attacks', list);
  };

  const deleteAttack = (id: string) => {
    updateField('attacks', (sheet.attacks || []).filter((a) => a.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--ink)' }}>
      {/* System Name Header */}
      <div style={{ background: 'var(--panel)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
        <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
          Rulebook / System Name
        </label>
        <input
          type="text"
          value={sheet.systemName}
          onChange={(e) => updateField('systemName', e.target.value)}
          placeholder="e.g. Cyberpunk RED, GURPS, Call of Cthulhu, My Homebrew..."
          style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '6px', padding: '6px 12px', fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}
        />
      </div>

      {/* Resource Pools (Health, Mana, Sanity, Cyberware, etc.) */}
      <div style={{ background: 'var(--panel)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={15} /> Resource Pools (Current / Max)
          </span>
          <button className="action-btn-secondary" onClick={addPool} style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
            <Plus size={11} /> Add Pool
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {(sheet.resourcePools || []).map((pool) => (
            <div
              key={pool.id}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '10px',
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <input
                  type="text"
                  value={pool.name}
                  onChange={(e) => updatePool(pool.id, { name: e.target.value })}
                  style={{ width: '100%', fontSize: '0.82rem', fontWeight: 700, background: 'transparent', border: 'none', textAlign: 'center' }}
                />
                <button className="icon-btn" onClick={() => deletePool(pool.id)} style={{ color: 'var(--crit)' }}>
                  <Trash2 size={12} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '6px' }}>
                <button
                  className="action-btn-secondary"
                  onClick={() => updatePool(pool.id, { current: Math.max(0, pool.current - 1) })}
                  style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                >
                  -
                </button>
                <input
                  type="number"
                  value={pool.current}
                  onChange={(e) => updatePool(pool.id, { current: parseInt(e.target.value, 10) || 0 })}
                  style={{ width: '45px', textAlign: 'center', fontSize: '1.15rem', fontWeight: 800, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px' }}
                />
                <span style={{ fontSize: '1.1rem' }}>/</span>
                <input
                  type="number"
                  value={pool.max}
                  onChange={(e) => updatePool(pool.id, { max: parseInt(e.target.value, 10) || 1 })}
                  style={{ width: '45px', textAlign: 'center', fontSize: '1.15rem', fontWeight: 800, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px' }}
                />
                <button
                  className="action-btn-secondary"
                  onClick={() => updatePool(pool.id, { current: Math.min(pool.max, pool.current + 1) })}
                  style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Attributes & Skills Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Custom Attributes */}
        <div style={{ background: 'var(--panel)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={14} /> Attributes & Primary Stats
            </span>
            <button className="action-btn-secondary" onClick={addAttribute} style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
              <Plus size={11} /> Add Stat
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(sheet.attributes || []).map((attr) => (
              <div
                key={attr.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  background: 'var(--bg)',
                  borderRadius: '6px',
                  border: '1px solid var(--line)',
                  gap: '8px',
                }}
              >
                <input
                  type="text"
                  value={attr.name}
                  onChange={(e) => updateAttribute(attr.id, { name: e.target.value })}
                  style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '0.85rem', fontWeight: 600 }}
                />
                <input
                  type="text"
                  value={attr.value}
                  onChange={(e) => updateAttribute(attr.id, { value: e.target.value })}
                  style={{ width: '60px', textAlign: 'center', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent)' }}
                />
                <button className="icon-btn" onClick={() => deleteAttribute(attr.id)} style={{ color: 'var(--crit)' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Skills */}
        <div style={{ background: 'var(--panel)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
              Skills & Proficiencies
            </span>
            <button className="action-btn-secondary" onClick={addSkill} style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
              <Plus size={11} /> Add Skill
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(sheet.skills || []).map((sk) => (
              <div
                key={sk.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  background: 'var(--bg)',
                  borderRadius: '6px',
                  border: '1px solid var(--line)',
                  gap: '8px',
                }}
              >
                <input
                  type="text"
                  value={sk.name}
                  onChange={(e) => updateSkill(sk.id, { name: e.target.value })}
                  style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '0.85rem' }}
                />
                <input
                  type="text"
                  value={sk.value}
                  onChange={(e) => updateSkill(sk.id, { value: e.target.value })}
                  style={{ width: '60px', textAlign: 'center', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '0.88rem', fontWeight: 600 }}
                />
                <button className="icon-btn" onClick={() => deleteSkill(sk.id)} style={{ color: 'var(--crit)' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attacks / Powers */}
      <div style={{ background: 'var(--panel)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sword size={14} /> Attacks, Weapons & Special Powers
          </span>
          <button className="action-btn-secondary" onClick={addAttack} style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
            <Plus size={11} /> Add Attack
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(sheet.attacks || []).map((atk) => (
            <div
              key={atk.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 80px 100px 1fr 28px',
                gap: '8px',
                alignItems: 'center',
                background: 'var(--bg)',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
              }}
            >
              <input
                type="text"
                placeholder="Weapon / Power"
                value={atk.name}
                onChange={(e) => updateAttack(atk.id, { name: e.target.value })}
                style={{ background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.85rem' }}
              />
              <input
                type="text"
                placeholder="Mod"
                value={atk.bonus}
                onChange={(e) => updateAttack(atk.id, { bonus: e.target.value })}
                style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px', padding: '2px 6px', fontSize: '0.82rem', textAlign: 'center' }}
              />
              <input
                type="text"
                placeholder="Damage / Effect"
                value={atk.damage}
                onChange={(e) => updateAttack(atk.id, { damage: e.target.value })}
                style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px', padding: '2px 6px', fontSize: '0.82rem', textAlign: 'center' }}
              />
              <input
                type="text"
                placeholder="Notes / Rules"
                value={atk.notes || ''}
                onChange={(e) => updateAttack(atk.id, { notes: e.target.value })}
                style={{ background: 'transparent', border: 'none', fontSize: '0.78rem', color: 'var(--muted)' }}
              />
              <button className="icon-btn" onClick={() => deleteAttack(atk.id)} style={{ color: 'var(--crit)' }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Special Rules & Lore Notes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: 'var(--panel)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
            Special Powers, Feats & Perks
          </span>
          <textarea
            rows={4}
            value={sheet.powersAbilities || ''}
            onChange={(e) => updateField('powersAbilities', e.target.value)}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '6px', padding: '8px', fontSize: '0.82rem' }}
          />
        </div>
        <div style={{ background: 'var(--panel)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
            System Rules & Campaign Notes
          </span>
          <textarea
            rows={4}
            value={sheet.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '6px', padding: '8px', fontSize: '0.82rem' }}
          />
        </div>
      </div>
    </div>
  );
};
