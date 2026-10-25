import React, { useState } from 'react';
import { X, ExternalLink, Shield, Skull, User, Sparkles, BookOpen } from 'lucide-react';
import { Character } from '../../types';
import {
  Dnd5eSheetView,
  Dnd5eMonsterView,
  ShadowdarkSheetView,
  ShadowdarkMonsterView,
  ValiantSheetView,
  ValiantMonsterView,
  CustomSystemSheetView,
} from './CharacterSheetViews';

interface CharacterSheetModalProps {
  character: Character;
  onClose: () => void;
  onNavigateToCharacterBuilder?: (id: string) => void;
  onUpdateCharacter?: (updated: Character) => void;
}

export const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({
  character,
  onClose,
  onNavigateToCharacterBuilder,
  onUpdateCharacter,
}) => {
  const isMonster = character.entityKind === 'monster';
  const hasSheet = character.sheetSystem && character.sheetSystem !== 'narrative';
  const [activeTab, setActiveTab] = useState<'sheet' | 'dossier'>(hasSheet ? 'sheet' : 'dossier');

  const updateCharacter = (updates: Partial<Character>) => {
    if (onUpdateCharacter) {
      onUpdateCharacter({ ...character, ...updates });
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '95%',
          maxWidth: '880px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--panel)',
          borderRadius: '12px',
          border: '1px solid var(--line)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isMonster ? 'rgba(185, 28, 28, 0.08)' : 'var(--panel)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>{isMonster ? '👹' : '👤'}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'Cinzel, serif', fontWeight: 700 }}>
                  {character.name}
                </h2>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: isMonster ? 'rgba(239, 68, 68, 0.15)' : 'rgba(176, 86, 122, 0.15)',
                    color: isMonster ? '#ef4444' : '#b0567a',
                    border: `1px solid ${isMonster ? 'rgba(239, 68, 68, 0.3)' : 'rgba(176, 86, 122, 0.3)'}`,
                  }}
                >
                  {isMonster ? 'Monster / Adversary' : 'Cast / Hero'}
                </span>
                {character.sheetSystem && character.sheetSystem !== 'narrative' && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: 'var(--accent-glow, rgba(186, 117, 23, 0.15))',
                      color: 'var(--accent)',
                      border: '1px solid var(--accent)',
                    }}
                  >
                    {character.sheetSystem === 'dnd5e'
                      ? 'D&D 5E'
                      : character.sheetSystem === 'shadowdark'
                      ? 'ShadowDark'
                      : character.sheetSystem === 'valiant'
                      ? 'Tales of the Valiant'
                      : 'Custom System'}
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)', marginTop: '2px' }}>
                {character.role || (isMonster ? 'Adversary' : 'Protagonist')} {character.archetype ? `· ${character.archetype}` : ''}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Tab switchers */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg)', padding: '3px', borderRadius: '8px', border: '1px solid var(--line)' }}>
              {hasSheet && (
                <button
                  className={`chip ${activeTab === 'sheet' ? 'active' : ''}`}
                  onClick={() => setActiveTab('sheet')}
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                >
                  TTRPG Sheet
                </button>
              )}
              <button
                className={`chip ${activeTab === 'dossier' ? 'active' : ''}`}
                onClick={() => setActiveTab('dossier')}
                style={{ fontSize: '0.75rem', padding: '3px 8px' }}
              >
                Writer Dossier
              </button>
            </div>

            {onNavigateToCharacterBuilder && (
              <button
                className="action-btn-secondary"
                onClick={() => {
                  onClose();
                  onNavigateToCharacterBuilder(character.id);
                }}
                title="Open full interactive sheet in Character Builder"
                style={{ fontSize: '0.76rem', padding: '5px 10px', gap: '5px' }}
              >
                <ExternalLink size={13} />
                <span>Full Builder</span>
              </button>
            )}

            <button
              className="icon-btn"
              onClick={onClose}
              title="Close sheet"
              style={{ color: 'var(--muted)' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {activeTab === 'sheet' && (
            <div>
              {/* D&D 5E */}
              {character.sheetSystem === 'dnd5e' && (
                isMonster && character.dnd5eMonster ? (
                  <Dnd5eMonsterView
                    sheet={character.dnd5eMonster}
                    onChange={(m) => updateCharacter({ dnd5eMonster: m })}
                  />
                ) : character.dnd5eSheet ? (
                  <Dnd5eSheetView
                    sheet={character.dnd5eSheet}
                    onChange={(s) => updateCharacter({ dnd5eSheet: s })}
                  />
                ) : null
              )}

              {/* ShadowDark */}
              {character.sheetSystem === 'shadowdark' && (
                isMonster && character.shadowdarkMonster ? (
                  <ShadowdarkMonsterView
                    sheet={character.shadowdarkMonster}
                    onChange={(m) => updateCharacter({ shadowdarkMonster: m })}
                  />
                ) : character.shadowdarkSheet ? (
                  <ShadowdarkSheetView
                    sheet={character.shadowdarkSheet}
                    onChange={(s) => updateCharacter({ shadowdarkSheet: s })}
                  />
                ) : null
              )}

              {/* Tales of the Valiant */}
              {character.sheetSystem === 'valiant' && (
                isMonster && character.valiantMonster ? (
                  <ValiantMonsterView
                    sheet={character.valiantMonster}
                    onChange={(m) => updateCharacter({ valiantMonster: m })}
                  />
                ) : character.valiantSheet ? (
                  <ValiantSheetView
                    sheet={character.valiantSheet}
                    onChange={(s) => updateCharacter({ valiantSheet: s })}
                  />
                ) : null
              )}

              {/* Custom System */}
              {character.sheetSystem === 'custom' && character.customSheet && (
                <CustomSystemSheetView
                  sheet={character.customSheet}
                  onChange={(s) => updateCharacter({ customSheet: s })}
                />
              )}
            </div>
          )}

          {activeTab === 'dossier' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                    Archetype / Identity
                  </label>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink)' }}>{character.archetype || 'Not specified'}</p>
                </div>
                <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                    Role in Narrative
                  </label>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink)' }}>{character.role || 'Not specified'}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: '#b91c1c', display: 'block', marginBottom: '4px' }}>
                    Core Wound / Backstory Trauma
                  </label>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
                    {character.wound || 'None specified'}
                  </p>
                </div>
                <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: '#c2410c', display: 'block', marginBottom: '4px' }}>
                    The Lie They Believe
                  </label>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
                    {character.lie || 'None specified'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: '4px' }}>
                    Wants (External Goal)
                  </label>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
                    {character.want || 'None specified'}
                  </p>
                </div>
                <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: '#047857', display: 'block', marginBottom: '4px' }}>
                    Needs (Internal Truth)
                  </label>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
                    {character.need || 'None specified'}
                  </p>
                </div>
              </div>

              {character.arc && (
                <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                    Character Arc & Transformation
                  </label>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
                    {character.arc}
                  </p>
                </div>
              )}

              {character.traits && character.traits.length > 0 && (
                <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                    Key Traits & Mannerisms
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {character.traits.map((trait, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.78rem',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: 'var(--panel)',
                          border: '1px solid var(--line)',
                        }}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
