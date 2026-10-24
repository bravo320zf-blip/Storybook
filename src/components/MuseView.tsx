import React, { useState } from 'react';
import { Sparkles, Dices, Send, Copy, Check } from 'lucide-react';
import { CardKind } from '../types';

interface MuseViewProps {
  onAddCardToStoryboard: (kind: CardKind, title: string, body: string) => void;
}

const FIRST_NAMES = [
  'Rhea', 'Malcolm', 'Aethel', 'Kaelen', 'Theron', 'Vesper', 'Soren', 'Isolde',
  'Corvus', 'Branoc', 'Rowan', 'Sylas', 'Orlaith', 'Cassian', 'Maren', 'Bram',
];
const SURNAMES = [
  'Voss', 'Sedge', 'Blackwood', 'Ashford', 'Val-Kora', 'Ironthorn', 'Duskward',
  'Crestfall', 'Oakhaven', 'Wintermute', 'Ravenscar', 'Holloway', 'Thornwall',
];

const PROMPTS = [
  {
    title: 'The Unkept Promise',
    hook: 'A messenger arrives bearing a coin sealed in lead. The sender died forty years ago, but the debt has just matured.',
  },
  {
    title: 'The Reluctant Inheritance',
    hook: 'The family vault contains neither gold nor weapons, but an iron cage that has been kept warm with fresh coals for three centuries.',
  },
  {
    title: 'A False Truce',
    hook: 'Two commanders sign the peace treaty on the frozen lake. Before the ink dries, both hear the ice groan beneath their chairs.',
  },
  {
    title: 'The Broken Ward',
    hook: 'The bell in the tower was only supposed to ring if an emperor died. Tonight it tolls seven times, and the sky turns the color of bruised plums.',
  },
];

const TWISTS = [
  'The enemy isn’t trying to breach the walls—they are barricading your characters inside.',
  'The mentor knew the cure all along, but keeping the protagonist afflicted was the only way to shield them from the inquisitors.',
  'The sacred map does not show where the city was built, but where the beast will next surface.',
  'The artifact only functions when wielded by someone who truly desires nothing from it.',
];

const PLACES = [
  'The Sunken Spire of Val-Kora',
  'The Basalt Eyrie at Windward Rim',
  'The Whispering Quarry of St. Jude',
  'The Cinder Forest of Aethelgard',
  'The Clockwork Orchard of Varos',
];

export const MuseView: React.FC<MuseViewProps> = ({ onAddCardToStoryboard }) => {
  const [generatedName, setGeneratedName] = useState('Rhea Voss');
  const [currentPrompt, setCurrentPrompt] = useState(PROMPTS[0]);
  const [currentTwist, setCurrentTwist] = useState(TWISTS[0]);
  const [currentPlace, setCurrentPlace] = useState(PLACES[0]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const rollName = () => {
    const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const l = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
    setGeneratedName(`${f} ${l}`);
  };

  const rollPrompt = () => {
    const p = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setCurrentPrompt(p);
  };

  const rollTwist = () => {
    const t = TWISTS[Math.floor(Math.random() * TWISTS.length)];
    setCurrentTwist(t);
  };

  const rollPlace = () => {
    const pl = PLACES[Math.floor(Math.random() * PLACES.length)];
    setCurrentPlace(pl);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="page-content">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', fontWeight: 600, color: 'var(--ink)' }}>
          Muse
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          Creative sparks, names, dilemmas, and twists when you need momentum. Muse never writes your story for you.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Name Generator Card */}
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#BA7517' }}>
                Character Name Generator
              </span>
              <button className="icon-btn" onClick={rollName} title="Roll new name">
                <Dices size={16} />
              </button>
            </div>
            <div
              style={{
                fontFamily: 'var(--serif)',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--ink)',
                padding: '16px 0',
              }}
            >
              {generatedName}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button
              className="action-btn-secondary"
              style={{ flex: 1 }}
              onClick={() => copyToClipboard(generatedName)}
            >
              {copiedText === generatedName ? <Check size={14} /> : <Copy size={14} />}
              <span>Copy</span>
            </button>
            <button
              className="action-btn-primary"
              style={{ flex: 1 }}
              onClick={() => onAddCardToStoryboard('character', generatedName, 'Character generated from Muse.')}
            >
              <Send size={14} />
              <span>To Storyboard</span>
            </button>
          </div>
        </div>

        {/* Story Hook Prompt Card */}
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#8a5cc0' }}>
                Story Opening Spark
              </span>
              <button className="icon-btn" onClick={rollPrompt} title="Roll new prompt">
                <Dices size={16} />
              </button>
            </div>
            <h4 style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>
              {currentPrompt.title}
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.5 }}>
              {currentPrompt.hook}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              className="action-btn-secondary"
              style={{ flex: 1 }}
              onClick={() => copyToClipboard(currentPrompt.hook)}
            >
              {copiedText === currentPrompt.hook ? <Check size={14} /> : <Copy size={14} />}
              <span>Copy</span>
            </button>
            <button
              className="action-btn-primary"
              style={{ flex: 1 }}
              onClick={() => onAddCardToStoryboard('idea', currentPrompt.title, currentPrompt.hook)}
            >
              <Send size={14} />
              <span>To Storyboard</span>
            </button>
          </div>
        </div>

        {/* Plot Twist Card */}
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#a3432b' }}>
                Narrative Twist & Complication
              </span>
              <button className="icon-btn" onClick={rollTwist} title="Roll new twist">
                <Dices size={16} />
              </button>
            </div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', color: 'var(--ink)', lineHeight: 1.5, fontStyle: 'italic' }}>
              "{currentTwist}"
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              className="action-btn-secondary"
              style={{ flex: 1 }}
              onClick={() => copyToClipboard(currentTwist)}
            >
              {copiedText === currentTwist ? <Check size={14} /> : <Copy size={14} />}
              <span>Copy</span>
            </button>
            <button
              className="action-btn-primary"
              style={{ flex: 1 }}
              onClick={() => onAddCardToStoryboard('beat', 'Plot Twist', currentTwist)}
            >
              <Send size={14} />
              <span>To Storyboard</span>
            </button>
          </div>
        </div>

        {/* Place & Setting Card */}
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#3E7A8C' }}>
                Setting & Landmark
              </span>
              <button className="icon-btn" onClick={rollPlace} title="Roll new setting">
                <Dices size={16} />
              </button>
            </div>
            <div
              style={{
                fontFamily: 'var(--serif)',
                fontSize: '1.45rem',
                fontWeight: 600,
                color: 'var(--ink)',
                padding: '12px 0',
              }}
            >
              {currentPlace}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              className="action-btn-secondary"
              style={{ flex: 1 }}
              onClick={() => copyToClipboard(currentPlace)}
            >
              {copiedText === currentPlace ? <Check size={14} /> : <Copy size={14} />}
              <span>Copy</span>
            </button>
            <button
              className="action-btn-primary"
              style={{ flex: 1 }}
              onClick={() => onAddCardToStoryboard('place', currentPlace, 'Atmospheric setting for upcoming chapter.')}
            >
              <Send size={14} />
              <span>To Storyboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
