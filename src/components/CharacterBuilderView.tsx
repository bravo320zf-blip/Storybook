import React, { useState } from 'react';
import { Plus, UserPlus, Trash2, Edit3, Cloud, Check } from 'lucide-react';
import { Character } from '../types';

interface CharacterBuilderViewProps {
  characters: Character[];
  onUpdateCharacters: (chars: Character[]) => void;
  onSyncDrive: () => Promise<void>;
}

export const CharacterBuilderView: React.FC<CharacterBuilderViewProps> = ({
  characters,
  onUpdateCharacters,
  onSyncDrive,
}) => {
  const [selectedChar, setSelectedChar] = useState<Character | null>(
    characters.length > 0 ? characters[0] : null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleAddNew = () => {
    const newChar: Character = {
      id: `char-${Date.now()}`,
      name: 'New Character',
      role: 'supporting',
      archetype: 'The Reluctant Ally',
      tagline: 'A compelling character who challenges the protagonist.',
      avatarColor: '#B0567A',
      traits: ['Determined', 'Clever'],
      wound: 'Betrayed by their closest confidant.',
      fear: 'Being forgotten or left behind.',
      lie: '"Self-reliance is the only true safety."',
      want: 'To reclaim their lost honor.',
      motivation: 'Protecting the few people they still trust.',
      need: 'To learn to trust others again.',
      arc: 'From solitary defensive loner to an indispensable partner.',
      notes: 'Distinctive scar or heirloom carried at all times.',
      created: Date.now(),
    };
    onUpdateCharacters([...characters, newChar]);
    setSelectedChar(newChar);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    const filtered = characters.filter((c) => c.id !== id);
    onUpdateCharacters(filtered);
    if (selectedChar?.id === id) {
      setSelectedChar(filtered.length > 0 ? filtered[0] : null);
    }
  };

  const handleFieldChange = (field: keyof Character, value: any) => {
    if (!selectedChar) return;
    const updated = { ...selectedChar, [field]: value };
    setSelectedChar(updated);
    onUpdateCharacters(characters.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDriveSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncDrive();
      alert('Character cast synced to Google Drive!');
    } catch (e) {
      alert('Failed to sync to Google Drive.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="page-content">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', fontWeight: 600, color: 'var(--ink)' }}>
            Character Builder
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Build your cast, uncover their core wounds, motivations, and narrative arcs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="action-btn-primary" onClick={handleAddNew}>
            <UserPlus size={15} />
            <span>New character</span>
          </button>
          <button className="action-btn-secondary" onClick={handleDriveSync} disabled={isSyncing}>
            <Cloud size={15} style={{ color: '#4285F4' }} />
            <span>{isSyncing ? 'Syncing...' : 'Sync to Drive'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '28px', minHeight: '600px' }}>
        {/* Character List Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {characters.map((char) => {
            const isSelected = selectedChar?.id === char.id;
            return (
              <div
                key={char.id}
                onClick={() => setSelectedChar(char)}
                style={{
                  background: isSelected ? 'var(--accent-soft)' : 'var(--panel)',
                  border: isSelected ? '1px solid var(--accent)' : '1px solid var(--line)',
                  borderRadius: '10px',
                  padding: '16px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: char.avatarColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                    }}
                  >
                    {char.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--ink)' }}>
                      {char.name}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'capitalize' }}>
                      {char.role} · {char.archetype}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                  {char.tagline}
                </p>
              </div>
            );
          })}
        </div>

        {/* Selected Character Dossier Detail */}
        {selectedChar ? (
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: 'var(--shadow)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Header / Name / Role row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input
                  type="color"
                  value={selectedChar.avatarColor}
                  onChange={(e) => handleFieldChange('avatarColor', e.target.value)}
                  style={{ width: '40px', height: '40px', border: 'none', borderRadius: '50%', cursor: 'pointer', background: 'transparent' }}
                  title="Change avatar color"
                />
                <div>
                  <input
                    type="text"
                    value={selectedChar.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    style={{
                      fontFamily: 'var(--serif)',
                      fontSize: '1.8rem',
                      fontWeight: 700,
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      color: 'var(--ink)',
                      width: '100%',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <select
                      value={selectedChar.role}
                      onChange={(e) => handleFieldChange('role', e.target.value)}
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--line)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.8rem',
                      }}
                    >
                      <option value="protagonist">Protagonist</option>
                      <option value="antagonist">Antagonist</option>
                      <option value="supporting">Supporting</option>
                      <option value="mentor">Mentor</option>
                      <option value="rival">Rival</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Archetype (e.g. The Reluctant Vessel)"
                      value={selectedChar.archetype}
                      onChange={(e) => handleFieldChange('archetype', e.target.value)}
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--line)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                className="icon-btn"
                onClick={() => handleDelete(selectedChar.id)}
                title="Delete character"
                style={{ color: 'var(--crit)' }}
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Tagline */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                Tagline / Essence
              </label>
              <input
                type="text"
                value={selectedChar.tagline}
                onChange={(e) => handleFieldChange('tagline', e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.92rem',
                }}
              />
            </div>

            {/* Psychological Pillars: Wound, Fear, Lie */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                  The Core Wound
                </label>
                <textarea
                  value={selectedChar.wound}
                  onChange={(e) => handleFieldChange('wound', e.target.value)}
                  rows={3}
                  placeholder="Formative trauma or betrayal..."
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '0.85rem',
                    resize: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                  Deepest Fear
                </label>
                <textarea
                  value={selectedChar.fear}
                  onChange={(e) => handleFieldChange('fear', e.target.value)}
                  rows={3}
                  placeholder="What terrifies them most..."
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '0.85rem',
                    resize: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                  The Lie They Believe
                </label>
                <textarea
                  value={selectedChar.lie}
                  onChange={(e) => handleFieldChange('lie', e.target.value)}
                  rows={3}
                  placeholder="The misconception about the world..."
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '0.85rem',
                    resize: 'none',
                  }}
                />
              </div>
            </div>

            {/* Want vs Need */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                  What They Want (External Objective)
                </label>
                <textarea
                  value={selectedChar.want}
                  onChange={(e) => handleFieldChange('want', e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '0.85rem',
                    resize: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                  What They Need (Internal Transformation)
                </label>
                <textarea
                  value={selectedChar.need}
                  onChange={(e) => handleFieldChange('need', e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '0.85rem',
                    resize: 'none',
                  }}
                />
              </div>
            </div>

            {/* Character Arc */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                Character Arc & Evolution
              </label>
              <textarea
                value={selectedChar.arc}
                onChange={(e) => handleFieldChange('arc', e.target.value)}
                rows={2}
                placeholder="How does this character change across the story?"
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  fontSize: '0.85rem',
                  resize: 'none',
                }}
              />
            </div>

            {/* Notes & Quirks */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                Notes, Heirlooms & Visual Details
              </label>
              <textarea
                value={selectedChar.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
            Select a character or click New Character to start.
          </div>
        )}
      </div>
    </div>
  );
};
