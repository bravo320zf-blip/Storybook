import React, { useState, useEffect } from 'react';
import {
  Plus,
  UserPlus,
  Trash2,
  Cloud,
  Search,
  Shield,
  Skull,
  Sword,
  Sparkles,
  BookOpen,
  Sliders,
  ChevronRight,
  Flame,
  Award,
  Layers,
  Heart,
  Check,
} from 'lucide-react';
import { Character, EntityKind, SheetSystem } from '../types';
import {
  Dnd5eSheetView,
  Dnd5eMonsterView,
  ShadowdarkSheetView,
  ShadowdarkMonsterView,
  ValiantSheetView,
  ValiantMonsterView,
  CustomSystemSheetView,
} from './characterSheets/CharacterSheetViews';
import {
  getDefaultDnd5eSheet,
  getDefaultDnd5eMonster,
  getDefaultShadowdarkSheet,
  getDefaultShadowdarkMonster,
  getDefaultValiantSheet,
  getDefaultValiantMonster,
  getDefaultCustomSheet,
} from '../utils/sheetDefaults';

interface CharacterBuilderViewProps {
  characters: Character[];
  onUpdateCharacters: (chars: Character[]) => void;
  onSyncDrive: () => Promise<void>;
  initialSelectedId?: string;
}

export const CharacterBuilderView: React.FC<CharacterBuilderViewProps> = ({
  characters,
  onUpdateCharacters,
  onSyncDrive,
  initialSelectedId,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(
    initialSelectedId && characters.some((c) => c.id === initialSelectedId)
      ? initialSelectedId
      : characters[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'narrative' | 'sheet'>(() => {
    const initChar = characters.find((c) => c.id === (initialSelectedId || characters[0]?.id));
    return initChar?.sheetSystem && initChar.sheetSystem !== 'narrative' ? 'sheet' : 'narrative';
  });
  const [entityFilter, setEntityFilter] = useState<'all' | 'character' | 'monster'>('all');
  const [systemFilter, setSystemFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (initialSelectedId && characters.some((c) => c.id === initialSelectedId)) {
      setSelectedCharId(initialSelectedId);
      const target = characters.find((c) => c.id === initialSelectedId);
      if (target?.sheetSystem && target.sheetSystem !== 'narrative') {
        setActiveTab('sheet');
      }
    }
  }, [initialSelectedId, characters]);

  const selectedChar = characters.find((c) => c.id === selectedCharId) || characters[0] || null;

  // Add new Character or Monster
  const handleAddNew = (kind: EntityKind = 'character', system: SheetSystem = 'narrative') => {
    const isMonster = kind === 'monster';
    const newId = `char-${Date.now()}`;
    const newChar: Character = {
      id: newId,
      name: isMonster ? 'New Monster / Adversary' : 'New Character',
      role: isMonster ? 'antagonist' : 'supporting',
      archetype: isMonster ? 'Apex Threat' : 'The Reluctant Ally',
      tagline: isMonster
        ? 'A formidable adversary challenging the characters.'
        : 'A compelling character who challenges the protagonist.',
      avatarColor: isMonster ? '#991b1b' : '#B0567A',
      traits: isMonster ? ['Ferocious', 'Cunning'] : ['Determined', 'Clever'],
      wound: isMonster ? 'Enslaved or driven from its natural territory.' : 'Betrayed by their closest confidant.',
      fear: isMonster ? 'Starvation or ancient banishment.' : 'Being forgotten or left behind.',
      lie: isMonster ? 'Power is the only law.' : '"Self-reliance is the only true safety."',
      want: isMonster ? 'Territorial dominance.' : 'To reclaim their lost honor.',
      motivation: isMonster ? 'Protecting its brood or lair.' : 'Protecting the few people they still trust.',
      need: isMonster ? 'A challenging reckoning.' : 'To learn to trust others again.',
      arc: isMonster ? 'From lurking rumor to catastrophic encounter.' : 'From defensive loner to indispensable partner.',
      notes: isMonster ? 'Lair effects, regional hazards, and trophy parts.' : 'Distinctive heirloom or mark carried at all times.',
      created: Date.now(),
      entityKind: kind,
      sheetSystem: system,
      dnd5eSheet: system === 'dnd5e' && !isMonster ? getDefaultDnd5eSheet() : undefined,
      dnd5eMonster: system === 'dnd5e' && isMonster ? getDefaultDnd5eMonster() : undefined,
      shadowdarkSheet: system === 'shadowdark' && !isMonster ? getDefaultShadowdarkSheet() : undefined,
      shadowdarkMonster: system === 'shadowdark' && isMonster ? getDefaultShadowdarkMonster() : undefined,
      valiantSheet: system === 'valiant' && !isMonster ? getDefaultValiantSheet() : undefined,
      valiantMonster: system === 'valiant' && isMonster ? getDefaultValiantMonster() : undefined,
      customSheet: system === 'custom' ? getDefaultCustomSheet() : undefined,
    };

    onUpdateCharacters([...characters, newChar]);
    setSelectedCharId(newId);
    if (system !== 'narrative') {
      setActiveTab('sheet');
    } else {
      setActiveTab('narrative');
    }
  };

  const handleDelete = (id: string) => {
    const target = characters.find((c) => c.id === id);
    if (window.confirm(`Delete "${target?.name || 'this entry'}"?`)) {
      const filtered = characters.filter((c) => c.id !== id);
      onUpdateCharacters(filtered);
      if (selectedCharId === id) {
        setSelectedCharId(filtered[0]?.id || '');
      }
    }
  };

  const handleUpdateCurrent = (updates: Partial<Character>) => {
    if (!selectedChar) return;
    const updated = { ...selectedChar, ...updates };
    onUpdateCharacters(characters.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Change Game System (populate defaults if not present)
  const handleChangeSystem = (system: SheetSystem) => {
    if (!selectedChar) return;
    const isMonster = selectedChar.entityKind === 'monster';
    const updates: Partial<Character> = { sheetSystem: system };

    if (system === 'dnd5e') {
      if (isMonster && !selectedChar.dnd5eMonster) updates.dnd5eMonster = getDefaultDnd5eMonster();
      if (!isMonster && !selectedChar.dnd5eSheet) updates.dnd5eSheet = getDefaultDnd5eSheet();
    } else if (system === 'shadowdark') {
      if (isMonster && !selectedChar.shadowdarkMonster) updates.shadowdarkMonster = getDefaultShadowdarkMonster();
      if (!isMonster && !selectedChar.shadowdarkSheet) updates.shadowdarkSheet = getDefaultShadowdarkSheet();
    } else if (system === 'valiant') {
      if (isMonster && !selectedChar.valiantMonster) updates.valiantMonster = getDefaultValiantMonster();
      if (!isMonster && !selectedChar.valiantSheet) updates.valiantSheet = getDefaultValiantSheet();
    } else if (system === 'custom') {
      if (!selectedChar.customSheet) updates.customSheet = getDefaultCustomSheet();
    }

    handleUpdateCurrent(updates);
    if (system !== 'narrative') {
      setActiveTab('sheet');
    }
  };

  // Switch Entity Kind between Character and Monster
  const handleToggleKind = (kind: EntityKind) => {
    if (!selectedChar) return;
    const updates: Partial<Character> = { entityKind: kind };

    if (kind === 'monster' && (!selectedChar.sheetSystem || selectedChar.sheetSystem === 'narrative')) {
      updates.sheetSystem = 'dnd5e';
      updates.dnd5eMonster = getDefaultDnd5eMonster();
    } else if (kind === 'monster') {
      if (selectedChar.sheetSystem === 'dnd5e' && !selectedChar.dnd5eMonster) updates.dnd5eMonster = getDefaultDnd5eMonster();
      if (selectedChar.sheetSystem === 'shadowdark' && !selectedChar.shadowdarkMonster) updates.shadowdarkMonster = getDefaultShadowdarkMonster();
      if (selectedChar.sheetSystem === 'valiant' && !selectedChar.valiantMonster) updates.valiantMonster = getDefaultValiantMonster();
    } else {
      if (selectedChar.sheetSystem === 'dnd5e' && !selectedChar.dnd5eSheet) updates.dnd5eSheet = getDefaultDnd5eSheet();
      if (selectedChar.sheetSystem === 'shadowdark' && !selectedChar.shadowdarkSheet) updates.shadowdarkSheet = getDefaultShadowdarkSheet();
      if (selectedChar.sheetSystem === 'valiant' && !selectedChar.valiantSheet) updates.valiantSheet = getDefaultValiantSheet();
    }

    handleUpdateCurrent(updates);
  };

  const handleDriveSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncDrive();
      alert('Cast & Bestiary synced to Google Drive!');
    } catch (e) {
      alert('Failed to sync to Google Drive.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Filtered List
  const filteredList = characters.filter((c) => {
    const isMonster = c.entityKind === 'monster';
    if (entityFilter === 'character' && isMonster) return false;
    if (entityFilter === 'monster' && !isMonster) return false;

    if (systemFilter !== 'all') {
      if (systemFilter === 'narrative' && c.sheetSystem && c.sheetSystem !== 'narrative') return false;
      if (systemFilter !== 'narrative' && c.sheetSystem !== systemFilter) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchTag = c.tagline?.toLowerCase().includes(q);
      const matchArch = c.archetype?.toLowerCase().includes(q);
      const matchRole = c.role?.toLowerCase().includes(q);
      return matchName || matchTag || matchArch || matchRole;
    }

    return true;
  });

  const charCount = characters.filter((c) => c.entityKind !== 'monster').length;
  const monsterCount = characters.filter((c) => c.entityKind === 'monster').length;

  return (
    <div className="page-content" style={{ maxWidth: '1360px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', fontWeight: 600, color: 'var(--ink)' }}>
            Characters & Bestiary
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
            Build your cast, forge monster stat blocks, and track fillable sheets for D&D 5E, ShadowDark, Tales of the Valiant, or custom systems.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="action-btn-primary" onClick={() => handleAddNew('character')}>
            <UserPlus size={15} />
            <span>New Character</span>
          </button>
          <button
            className="action-btn-secondary"
            onClick={() => handleAddNew('monster', 'dnd5e')}
            style={{ color: '#b91c1c', borderColor: '#b91c1c' }}
          >
            <Skull size={15} />
            <span>New Monster / Foe</span>
          </button>
          <button className="action-btn-secondary" onClick={handleDriveSync} disabled={isSyncing}>
            <Cloud size={15} style={{ color: '#4285F4' }} />
            <span>{isSyncing ? 'Syncing...' : 'Sync to Drive'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Sidebar & Right Detail Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', minHeight: '680px' }}>
        {/* Left Column: Filter Tabs, Search & Entity List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Entity Kind Filter Pills */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--panel)', padding: '3px', borderRadius: '8px', border: '1px solid var(--line)' }}>
            <button
              className={`chip ${entityFilter === 'all' ? 'active' : ''}`}
              onClick={() => setEntityFilter('all')}
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.74rem', padding: '3px 6px' }}
            >
              All ({characters.length})
            </button>
            <button
              className={`chip ${entityFilter === 'character' ? 'active' : ''}`}
              onClick={() => setEntityFilter('character')}
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.74rem', padding: '3px 6px' }}
            >
              Cast ({charCount})
            </button>
            <button
              className={`chip ${entityFilter === 'monster' ? 'active' : ''}`}
              onClick={() => setEntityFilter('monster')}
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.74rem', padding: '3px 6px', color: entityFilter === 'monster' ? '#fff' : '#b91c1c' }}
            >
              Monsters ({monsterCount})
            </button>
          </div>

          {/* Search & System Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--muted)' }} />
              <input
                type="text"
                placeholder="Search by name, role, class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px 6px 28px',
                  fontSize: '0.82rem',
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  color: 'var(--ink)',
                }}
              />
            </div>

            <select
              value={systemFilter}
              onChange={(e) => setSystemFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '5px 8px',
                fontSize: '0.76rem',
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                color: 'var(--muted)',
              }}
            >
              <option value="all">Filter: All Systems</option>
              <option value="dnd5e">D&D 5th Edition</option>
              <option value="shadowdark">ShadowDark RPG</option>
              <option value="valiant">Tales of the Valiant</option>
              <option value="custom">Custom Homebrew</option>
              <option value="narrative">Narrative Only</option>
            </select>
          </div>

          {/* Entity List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', maxHeight: '72vh' }}>
            {filteredList.length === 0 ? (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.84rem' }}>
                No entries match your search.
              </div>
            ) : (
              filteredList.map((c) => {
                const isSelected = selectedChar?.id === c.id;
                const isMonster = c.entityKind === 'monster';

                let systemLabel = 'Story';
                if (c.sheetSystem === 'dnd5e') systemLabel = '5E';
                else if (c.sheetSystem === 'shadowdark') systemLabel = 'ShadowDark';
                else if (c.sheetSystem === 'valiant') systemLabel = 'Valiant';
                else if (c.sheetSystem === 'custom') systemLabel = c.customSheet?.systemName || 'Custom';

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCharId(c.id)}
                    style={{
                      background: isSelected ? 'var(--accent-soft)' : 'var(--panel)',
                      border: isSelected ? '1px solid var(--accent)' : '1px solid var(--line)',
                      borderLeft: isMonster ? '4px solid #b91c1c' : isSelected ? '4px solid var(--accent)' : '1px solid var(--line)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: isMonster ? '#7f1d1d' : c.avatarColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '0.78rem',
                            flexShrink: 0,
                          }}
                        >
                          {isMonster ? <Skull size={13} /> : c.name.charAt(0)}
                        </div>
                        <span
                          style={{
                            fontFamily: 'var(--serif)',
                            fontSize: '0.98rem',
                            fontWeight: 600,
                            color: 'var(--ink)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {c.name}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '0.66rem',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          background: isMonster ? '#fef2f2' : 'var(--bg)',
                          color: isMonster ? '#991b1b' : 'var(--accent)',
                          border: isMonster ? '1px solid #fecaca' : '1px solid var(--line)',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {systemLabel}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ textTransform: 'capitalize' }}>
                        {isMonster ? `Monster · ${c.dnd5eMonster?.cr ? 'CR ' + c.dnd5eMonster.cr : c.archetype}` : `${c.role} · ${c.archetype}`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Entity Dossier & System Sheet */}
        {selectedChar ? (
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: '12px',
              padding: '24px 28px',
              boxShadow: 'var(--shadow)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Header: Avatar, Name, Entity Kind, System Selector, Delete */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '16px', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
                <input
                  type="color"
                  value={selectedChar.avatarColor}
                  onChange={(e) => handleUpdateCurrent({ avatarColor: e.target.value })}
                  style={{ width: '38px', height: '38px', border: 'none', borderRadius: '50%', cursor: 'pointer', background: 'transparent' }}
                  title="Change avatar color"
                />

                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={selectedChar.name}
                    onChange={(e) => handleUpdateCurrent({ name: e.target.value })}
                    placeholder="Entity Name..."
                    style={{
                      fontFamily: 'var(--serif)',
                      fontSize: '1.7rem',
                      fontWeight: 700,
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      color: selectedChar.entityKind === 'monster' ? '#b91c1c' : 'var(--ink)',
                      width: '100%',
                    }}
                  />

                  {/* Entity Kind & System Configuration Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {/* Character vs Monster Switcher */}
                    <div style={{ display: 'flex', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '6px', padding: '2px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleKind('character')}
                        style={{
                          background: selectedChar.entityKind !== 'monster' ? 'var(--accent)' : 'transparent',
                          color: selectedChar.entityKind !== 'monster' ? '#fff' : 'var(--muted)',
                          border: 'none',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        Character / NPC
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleKind('monster')}
                        style={{
                          background: selectedChar.entityKind === 'monster' ? '#b91c1c' : 'transparent',
                          color: selectedChar.entityKind === 'monster' ? '#fff' : 'var(--muted)',
                          border: 'none',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        Monster / Foe
                      </button>
                    </div>

                    {/* Game System Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>System:</span>
                      <select
                        value={selectedChar.sheetSystem || 'narrative'}
                        onChange={(e) => handleChangeSystem(e.target.value as SheetSystem)}
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--line)',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.78rem',
                          color: 'var(--ink)',
                          fontWeight: 600,
                        }}
                      >
                        <option value="narrative">Story Only (No Sheet)</option>
                        <option value="dnd5e">D&D 5th Edition</option>
                        <option value="shadowdark">ShadowDark RPG</option>
                        <option value="valiant">Tales of the Valiant</option>
                        <option value="custom">Custom System</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <button
                className="icon-btn"
                onClick={() => handleDelete(selectedChar.id)}
                title="Delete entry"
                style={{ color: 'var(--crit)' }}
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* View Switcher: Narrative Dossier vs System Sheet */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', gap: '12px' }}>
              <button
                onClick={() => setActiveTab('narrative')}
                style={{
                  padding: '8px 14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'narrative' ? '2.5px solid var(--accent)' : '2.5px solid transparent',
                  color: activeTab === 'narrative' ? 'var(--accent)' : 'var(--muted)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <BookOpen size={14} />
                <span>Writer Dossier & Arc</span>
              </button>

              <button
                onClick={() => setActiveTab('sheet')}
                style={{
                  padding: '8px 14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'sheet' ? '2.5px solid var(--accent)' : '2.5px solid transparent',
                  color: activeTab === 'sheet' ? 'var(--accent)' : 'var(--muted)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Shield size={14} />
                <span>
                  {selectedChar.sheetSystem === 'dnd5e'
                    ? selectedChar.entityKind === 'monster' ? 'D&D 5E Monster Block' : 'D&D 5E Character Sheet'
                    : selectedChar.sheetSystem === 'shadowdark'
                    ? selectedChar.entityKind === 'monster' ? 'ShadowDark Monster Block' : 'ShadowDark Character Sheet'
                    : selectedChar.sheetSystem === 'valiant'
                    ? selectedChar.entityKind === 'monster' ? 'Tales of the Valiant Monster' : 'Tales of the Valiant Sheet'
                    : selectedChar.sheetSystem === 'custom'
                    ? `${selectedChar.customSheet?.systemName || 'Custom'} Sheet`
                    : 'TTRPG Sheet'}
                </span>
              </button>
            </div>

            {/* TAB 1: Writer's Narrative Dossier */}
            {activeTab === 'narrative' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Role & Archetype */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                      Narrative Role
                    </label>
                    <select
                      value={selectedChar.role}
                      onChange={(e) => handleUpdateCurrent({ role: e.target.value as any })}
                      style={{
                        width: '100%',
                        background: 'var(--bg)',
                        border: '1px solid var(--line)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '0.84rem',
                      }}
                    >
                      <option value="protagonist">Protagonist</option>
                      <option value="antagonist">Antagonist / Boss</option>
                      <option value="supporting">Supporting / Companion</option>
                      <option value="mentor">Mentor / Patron</option>
                      <option value="rival">Rival / Adversary</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                      Archetype / Trope
                    </label>
                    <input
                      type="text"
                      value={selectedChar.archetype}
                      onChange={(e) => handleUpdateCurrent({ archetype: e.target.value })}
                      placeholder="e.g. The Reluctant Vessel, Apex Predator..."
                      style={{
                        width: '100%',
                        background: 'var(--bg)',
                        border: '1px solid var(--line)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '0.84rem',
                      }}
                    />
                  </div>
                </div>

                {/* Tagline */}
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                    Tagline / Essence
                  </label>
                  <input
                    type="text"
                    value={selectedChar.tagline}
                    onChange={(e) => handleUpdateCurrent({ tagline: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '0.84rem',
                    }}
                  />
                </div>

                {/* The 4 Core Story Pillars: Wound, Lie, Want, Need */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--crit)', display: 'block', marginBottom: '4px' }}>
                      The Wound (Past Trauma)
                    </label>
                    <textarea
                      rows={2}
                      value={selectedChar.wound}
                      onChange={(e) => handleUpdateCurrent({ wound: e.target.value })}
                      placeholder="The defining past injury or betrayal..."
                      style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.82rem', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#d97706', display: 'block', marginBottom: '4px' }}>
                      The Lie (Flawed Belief)
                    </label>
                    <textarea
                      rows={2}
                      value={selectedChar.lie}
                      onChange={(e) => handleUpdateCurrent({ lie: e.target.value })}
                      placeholder="The untrue premise they believe about the world..."
                      style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.82rem', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: '4px' }}>
                      The Want (External Goal)
                    </label>
                    <textarea
                      rows={2}
                      value={selectedChar.want}
                      onChange={(e) => handleUpdateCurrent({ want: e.target.value })}
                      placeholder="What they consciously seek..."
                      style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.82rem', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#10b981', display: 'block', marginBottom: '4px' }}>
                      The Need (Internal Growth)
                    </label>
                    <textarea
                      rows={2}
                      value={selectedChar.need}
                      onChange={(e) => handleUpdateCurrent({ need: e.target.value })}
                      placeholder="The spiritual truth they must embrace..."
                      style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.82rem', resize: 'vertical' }}
                    />
                  </div>
                </div>

                {/* Character Arc & Appearance */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                      Character Arc Progression
                    </label>
                    <textarea
                      rows={3}
                      value={selectedChar.arc}
                      onChange={(e) => handleUpdateCurrent({ arc: e.target.value })}
                      placeholder="From defensive survivor to cooperative savior..."
                      style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '6px', padding: '8px', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                      Appearance & Distinguishing Marks
                    </label>
                    <textarea
                      rows={3}
                      value={selectedChar.appearance || ''}
                      onChange={(e) => handleUpdateCurrent({ appearance: e.target.value })}
                      placeholder="Physical features, distinctive clothing, scars, carriage..."
                      style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '6px', padding: '8px', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                {/* Traits & Lore Notes */}
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                    Personality Traits & Notes
                  </label>
                  <textarea
                    rows={3}
                    value={selectedChar.notes || ''}
                    onChange={(e) => handleUpdateCurrent({ notes: e.target.value })}
                    placeholder="Quirks, speech patterns, lore background, relationships..."
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '6px', padding: '8px', fontSize: '0.82rem' }}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: TTRPG System Sheet / Stat Block */}
            {activeTab === 'sheet' && (
              <div>
                {/* When no system is selected, offer quick setup buttons */}
                {(!selectedChar.sheetSystem || selectedChar.sheetSystem === 'narrative') && (
                  <div
                    style={{
                      padding: '36px 20px',
                      textAlign: 'center',
                      background: 'var(--bg)',
                      borderRadius: '10px',
                      border: '1px dashed var(--line)',
                    }}
                  >
                    <Shield size={32} style={{ color: 'var(--accent)', margin: '0 auto 12px' }} />
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>Choose a TTRPG Character / Monster Sheet</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '0.86rem', maxWidth: '480px', margin: '0 auto 18px' }}>
                      Select a rules system below to generate an interactive fillable character sheet or monster stat block.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <button className="action-btn-primary" onClick={() => handleChangeSystem('dnd5e')}>
                        <Sword size={14} />
                        <span>D&D 5E Sheet</span>
                      </button>
                      <button className="action-btn-secondary" onClick={() => handleChangeSystem('shadowdark')}>
                        <Flame size={14} />
                        <span>ShadowDark Sheet</span>
                      </button>
                      <button className="action-btn-secondary" onClick={() => handleChangeSystem('valiant')}>
                        <Sparkles size={14} />
                        <span>Tales of the Valiant</span>
                      </button>
                      <button className="action-btn-secondary" onClick={() => handleChangeSystem('custom')}>
                        <Sliders size={14} />
                        <span>Custom Homebrew Sheet</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 1. D&D 5E */}
                {selectedChar.sheetSystem === 'dnd5e' && (
                  selectedChar.entityKind === 'monster' ? (
                    <Dnd5eMonsterView
                      sheet={selectedChar.dnd5eMonster || getDefaultDnd5eMonster()}
                      onChange={(updated) => handleUpdateCurrent({ dnd5eMonster: updated })}
                    />
                  ) : (
                    <Dnd5eSheetView
                      sheet={selectedChar.dnd5eSheet || getDefaultDnd5eSheet()}
                      onChange={(updated) => handleUpdateCurrent({ dnd5eSheet: updated })}
                    />
                  )
                )}

                {/* 2. ShadowDark */}
                {selectedChar.sheetSystem === 'shadowdark' && (
                  selectedChar.entityKind === 'monster' ? (
                    <ShadowdarkMonsterView
                      sheet={selectedChar.shadowdarkMonster || getDefaultShadowdarkMonster()}
                      onChange={(updated) => handleUpdateCurrent({ shadowdarkMonster: updated })}
                    />
                  ) : (
                    <ShadowdarkSheetView
                      sheet={selectedChar.shadowdarkSheet || getDefaultShadowdarkSheet()}
                      onChange={(updated) => handleUpdateCurrent({ shadowdarkSheet: updated })}
                    />
                  )
                )}

                {/* 3. Tales of the Valiant */}
                {selectedChar.sheetSystem === 'valiant' && (
                  selectedChar.entityKind === 'monster' ? (
                    <ValiantMonsterView
                      sheet={selectedChar.valiantMonster || getDefaultValiantMonster()}
                      onChange={(updated) => handleUpdateCurrent({ valiantMonster: updated })}
                    />
                  ) : (
                    <ValiantSheetView
                      sheet={selectedChar.valiantSheet || getDefaultValiantSheet()}
                      onChange={(updated) => handleUpdateCurrent({ valiantSheet: updated })}
                    />
                  )
                )}

                {/* 4. Custom Homebrew System */}
                {selectedChar.sheetSystem === 'custom' && (
                  <CustomSystemSheetView
                    sheet={selectedChar.customSheet || getDefaultCustomSheet()}
                    onChange={(updated) => handleUpdateCurrent({ customSheet: updated })}
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              padding: '60px',
              color: 'var(--muted)',
              background: 'var(--panel)',
              borderRadius: '12px',
              border: '1px solid var(--line)',
            }}
          >
            <UserPlus size={36} style={{ marginBottom: '12px', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>No Character Selected</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>Select an entry from the list or forge a new character or monster.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="action-btn-primary" onClick={() => handleAddNew('character')}>
                + New Character
              </button>
              <button className="action-btn-secondary" onClick={() => handleAddNew('monster', 'dnd5e')}>
                + New Monster
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
