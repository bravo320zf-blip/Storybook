import React, { useState } from 'react';
import {
  Sparkles,
  Dices,
  Send,
  Copy,
  Check,
  Compass,
  Users,
  Skull,
  Layers,
  Flame,
  MessageSquare,
  Scale,
  Zap,
  Bot,
  Settings,
  X,
  ExternalLink,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { CardKind, Character, MapStamp, Story, UserConfig, StoryboardCard } from '../types';
import {
  MuseGenre,
  GeneratedCharacter,
  GeneratedMonster,
  GeneratedHook,
  GeneratedTwist,
  GeneratedPlace,
  GeneratedRelic,
  GeneratedDilemma,
  GeneratedDialogue,
  MasterSceneSpark,
  generateCharacter,
  generateMonster,
  generateHook,
  generateTwist,
  generatePlace,
  generateRelic,
  generateDilemma,
  generateDialogue,
  generateMasterScene,
} from '../utils/museGenerators';
import { generateFreeAiPrompt } from '../services/freeAiService';

function inferStampType(name: string, desc: string): string {
  const text = `${name} ${desc}`.toLowerCase();
  if (text.includes('tower') || text.includes('spire') || text.includes('beacon') || text.includes('lighthouse') || text.includes('obelisk')) return 'tower';
  if (text.includes('citadel') || text.includes('castle') || text.includes('fort') || text.includes('keep') || text.includes('bastion') || text.includes('palace') || text.includes('stronghold')) return 'castle';
  if (text.includes('cave') || text.includes('cavern') || text.includes('chasm') || text.includes('mine') || text.includes('quarry') || text.includes('grotto') || text.includes('catacomb')) return 'cave';
  if (text.includes('forest') || text.includes('wood') || text.includes('grove') || text.includes('tree') || text.includes('jungle') || text.includes('swamp') || text.includes('marsh')) return 'tree';
  if (text.includes('port') || text.includes('harbor') || text.includes('dock') || text.includes('bay') || text.includes('cove') || text.includes('wharf')) return 'port';
  if (text.includes('mountain') || text.includes('peak') || text.includes('ridge') || text.includes('cliff')) return 'mountain';
  if (text.includes('shrine') || text.includes('temple') || text.includes('monolith') || text.includes('altar') || text.includes('crypt')) return 'monolith';
  return 'ruins';
}

interface MuseViewProps {
  onAddCardToStoryboard: (kind: CardKind, title: string, body: string, extra?: Partial<StoryboardCard>) => void;
  onAddCharacter?: (char: Partial<Character>) => string | void;
  onAddStampToMap?: (stamp: Partial<MapStamp>) => void;
  onNavigate?: (view: string) => void;
  config?: UserConfig;
  onUpdateConfig?: (cfg: UserConfig) => void;
}

const GENRE_LABELS: { id: MuseGenre; label: string; icon: string; desc: string }[] = [
  { id: 'fantasy', label: 'High Fantasy', icon: '🗡️', desc: 'Ancient magic, kingdoms, oaths, and forgotten bloodlines.' },
  { id: 'grimdark', label: 'Grimdark & OSR', icon: '💀', desc: 'Blood, ash, brutal survival, corruption, and dark bargains.' },
  { id: 'scifi', label: 'Sci-Fi & Cyberpunk', icon: '🚀', desc: 'Cold void, rogue AI, cyberware, mega-corps, and alien ruins.' },
  { id: 'horror', label: 'Gothic & Eldritch', icon: '🕯️', desc: 'Psychological terror, crypts, creeping madness, and ancient curses.' },
  { id: 'mystery', label: 'Noir & Mystery', icon: '🔍', desc: 'Dead couriers, blackmail, smoke-filled rooms, and twisted alibis.' },
  { id: 'mythic', label: 'Mythic & Epic', icon: '⚡', desc: 'Demigods, prophecies, cosmic monsters, and divine trials.' },
];

export const MuseView: React.FC<MuseViewProps> = ({
  onAddCardToStoryboard,
  onAddCharacter,
  onAddStampToMap,
  onNavigate,
  config,
  onUpdateConfig,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<MuseGenre>('fantasy');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active procedural values
  const [charSpark, setCharSpark] = useState<GeneratedCharacter>(() => generateCharacter('fantasy'));
  const [monsterSpark, setMonsterSpark] = useState<GeneratedMonster>(() => generateMonster('fantasy'));
  const [hookSpark, setHookSpark] = useState<GeneratedHook>(() => generateHook('fantasy'));
  const [twistSpark, setTwistSpark] = useState<GeneratedTwist>(() => generateTwist('fantasy'));
  const [placeSpark, setPlaceSpark] = useState<GeneratedPlace>(() => generatePlace('fantasy'));
  const [relicSpark, setRelicSpark] = useState<GeneratedRelic>(() => generateRelic('fantasy'));
  const [dilemmaSpark, setDilemmaSpark] = useState<GeneratedDilemma>(() => generateDilemma());
  const [dialogueSpark, setDialogueSpark] = useState<GeneratedDialogue>(() => generateDialogue());

  // Master Scene Spark State
  const [masterScene, setMasterScene] = useState<MasterSceneSpark | null>(null);

  // Free AI Mode State
  const [activeTab, setActiveTab] = useState<'oracle' | 'ai'>('oracle');
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<'gemini' | 'ollama'>('gemini');
  const [geminiKeyInput, setGeminiKeyInput] = useState(() => localStorage.getItem('muse_free_gemini_key') || '');
  const [ollamaEndpointInput, setOllamaEndpointInput] = useState(() => localStorage.getItem('muse_ollama_endpoint') || 'http://localhost:11434');
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Change Genre and roll fresh sparks
  const handleSelectGenre = (genre: MuseGenre) => {
    setSelectedGenre(genre);
    setCharSpark(generateCharacter(genre));
    setMonsterSpark(generateMonster(genre));
    setHookSpark(generateHook(genre));
    setTwistSpark(generateTwist(genre));
    setPlaceSpark(generatePlace(genre));
    setRelicSpark(generateRelic(genre));
  };

  // Roll All Cards
  const handleRollAll = () => {
    setCharSpark(generateCharacter(selectedGenre));
    setMonsterSpark(generateMonster(selectedGenre));
    setHookSpark(generateHook(selectedGenre));
    setTwistSpark(generateTwist(selectedGenre));
    setPlaceSpark(generatePlace(selectedGenre));
    setRelicSpark(generateRelic(selectedGenre));
    setDilemmaSpark(generateDilemma());
    setDialogueSpark(generateDialogue());
    showToast('Rolled fresh sparks for all categories!');
  };

  // Roll Full Master Scene
  const handleRollMasterScene = () => {
    const scene = generateMasterScene(selectedGenre);
    setMasterScene(scene);
  };

  // Free AI Generation
  const handleExecuteFreeAi = async () => {
    if (!aiPromptInput.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      if (aiProvider === 'gemini') {
        localStorage.setItem('muse_free_gemini_key', geminiKeyInput.trim());
      } else {
        localStorage.setItem('muse_ollama_endpoint', ollamaEndpointInput.trim());
      }

      const systemPrompt = `You are Muse, an evocative, highly creative storytelling assistant for novelists, worldbuilders, and storytellers. Generate vivid, unexpected, original creative sparks in the genre of ${selectedGenre.toUpperCase()}. Never be generic or clichéd. Format with punchy headings and rich sensory details.`;
      const result = await generateFreeAiPrompt(systemPrompt, aiPromptInput.trim(), {
        provider: aiProvider,
        geminiApiKey: geminiKeyInput,
        ollamaEndpoint: ollamaEndpointInput,
      });

      setAiResult(result);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate from free AI provider.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="page-content" style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--ink)',
            color: 'var(--bg)',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            boxShadow: 'var(--shadow-lg)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <Check size={16} style={{ color: 'var(--good)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
              Muse · The Infinite Spark Engine
            </h1>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(186, 117, 23, 0.15)',
                color: 'var(--accent)',
                fontWeight: 700,
                textTransform: 'uppercase',
                border: '1px solid var(--accent)',
              }}
            >
              100% Free & Unlimited
            </span>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', margin: 0, maxWidth: '680px', lineHeight: 1.45 }}>
            Procedural narrative sparks, character wounds, lethal monsters, and plot reversals. Generates millions of unique permutations with zero tokens, zero API fees, and zero latency.
          </p>
        </div>

        {/* Global Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Mode Switcher */}
          <div style={{ display: 'flex', background: 'var(--panel)', padding: '3px', borderRadius: '8px', border: '1px solid var(--line)' }}>
            <button
              className={`chip ${activeTab === 'oracle' ? 'active' : ''}`}
              onClick={() => setActiveTab('oracle')}
              style={{ fontSize: '0.78rem', padding: '4px 10px', gap: '5px' }}
            >
              <Dices size={13} />
              <span>Procedural Oracle</span>
            </button>
            <button
              className={`chip ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
              style={{ fontSize: '0.78rem', padding: '4px 10px', gap: '5px' }}
            >
              <Bot size={13} />
              <span>Free AI Muse</span>
            </button>
          </div>

          <button
            className="action-btn-primary"
            onClick={handleRollMasterScene}
            style={{ fontSize: '0.82rem', padding: '6px 14px', gap: '6px' }}
            title="Generate a multi-layered master scene outline"
          >
            <Zap size={14} />
            <span>⚡ Spark Full Scene</span>
          </button>

          <button
            className="action-btn-secondary"
            onClick={handleRollAll}
            style={{ fontSize: '0.82rem', padding: '6px 12px', gap: '6px' }}
            title="Roll new results across all category cards"
          >
            <RefreshCw size={13} />
            <span>Roll All</span>
          </button>
        </div>
      </div>

      {/* Genre Selector Pills */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '26px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {GENRE_LABELS.map((g) => {
          const isSelected = selectedGenre === g.id;
          return (
            <button
              key={g.id}
              onClick={() => handleSelectGenre(g.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: isSelected ? 'var(--accent)' : 'var(--panel)',
                color: isSelected ? '#fff' : 'var(--ink)',
                border: isSelected ? '1px solid var(--accent)' : '1px solid var(--line)',
                cursor: 'pointer',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.84rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 2px 8px rgba(186, 117, 23, 0.25)' : 'none',
              }}
              title={g.desc}
            >
              <span>{g.icon}</span>
              <span>{g.label}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FREE AI MUSE TAB VIEW                                         */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'ai' && (
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '28px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={18} style={{ color: 'var(--accent)' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontFamily: 'Cinzel, serif' }}>
                Free AI Muse Generator
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--muted)', background: 'var(--bg)', padding: '2px 8px', borderRadius: '10px' }}>
                Provider: {aiProvider === 'gemini' ? 'Google Gemini Free Tier' : 'Local Ollama'}
              </span>
            </div>

            <button
              className="action-btn-secondary"
              onClick={() => setIsAiSettingsOpen(!isAiSettingsOpen)}
              style={{ fontSize: '0.76rem', padding: '4px 10px', gap: '5px' }}
            >
              <Settings size={13} />
              <span>{isAiSettingsOpen ? 'Hide API Settings' : 'Configure Free Provider'}</span>
            </button>
          </div>

          {/* AI Settings Drawer */}
          {isAiSettingsOpen && (
            <div
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '14px 16px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="aiProvider"
                    checked={aiProvider === 'gemini'}
                    onChange={() => setAiProvider('gemini')}
                  />
                  <span>Google Gemini Free Tier (Cloud, 0 cost)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="aiProvider"
                    checked={aiProvider === 'ollama'}
                    onChange={() => setAiProvider('ollama')}
                  />
                  <span>Local Ollama (100% Offline PC)</span>
                </label>
              </div>

              {aiProvider === 'gemini' ? (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                    Google Gemini API Key (Get 100% free at ai.google.dev — No credit card required)
                  </label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={geminiKeyInput}
                    onChange={(e) => setGeminiKeyInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'var(--panel)',
                      border: '1px solid var(--line)',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      color: 'var(--ink)',
                    }}
                  />
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                    Local Ollama Endpoint (Default: http://localhost:11434)
                  </label>
                  <input
                    type="text"
                    value={ollamaEndpointInput}
                    onChange={(e) => setOllamaEndpointInput(e.target.value)}
                    placeholder="http://localhost:11434"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'var(--panel)',
                      border: '1px solid var(--line)',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      color: 'var(--ink)',
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* AI Prompt Input Bar */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <input
              type="text"
              placeholder={`Ask Muse for anything in ${selectedGenre}... (e.g. "Three dark rumors about the sunken fortress" or "A lethal ambush complication")`}
              value={aiPromptInput}
              onChange={(e) => setAiPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleExecuteFreeAi();
              }}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: 'var(--ink)',
              }}
            />
            <button
              className="action-btn-primary"
              onClick={handleExecuteFreeAi}
              disabled={aiLoading}
              style={{ padding: '8px 18px', gap: '6px' }}
            >
              {aiLoading ? <RefreshCw size={14} className="spin" /> : <Sparkles size={14} />}
              <span>{aiLoading ? 'Sparking...' : 'Generate'}</span>
            </button>
          </div>

          {/* Error Message */}
          {aiError && (
            <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: 'var(--crit)', fontSize: '0.84rem', marginBottom: '12px' }}>
              {aiError}
            </div>
          )}

          {/* AI Output Result Box */}
          {aiResult && (
            <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '8px', padding: '16px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)' }}>
                  Generated Spark
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="action-btn-secondary"
                    onClick={() => copyToClipboard(aiResult, 'ai-res')}
                    style={{ fontSize: '0.74rem', padding: '4px 8px', gap: '4px' }}
                  >
                    {copiedKey === 'ai-res' ? <Check size={12} /> : <Copy size={12} />}
                    <span>Copy</span>
                  </button>
                  <button
                    className="action-btn-primary"
                    onClick={() => {
                      onAddCardToStoryboard('idea', 'AI Muse Spark', aiResult, { tag: 'AI Muse', width: 280 });
                      showToast('Sent AI spark to Storyboard!');
                    }}
                    style={{ fontSize: '0.74rem', padding: '4px 8px', gap: '4px' }}
                  >
                    <Send size={12} />
                    <span>To Storyboard</span>
                  </button>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {aiResult}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MASTER SCENE SPARK BANNER (IF ACTIVE)                          */}
      {/* ------------------------------------------------------------- */}
      {masterScene && (
        <div
          style={{
            background: 'var(--panel)',
            border: '2px solid var(--accent)',
            borderRadius: '12px',
            padding: '22px 24px',
            marginBottom: '28px',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} style={{ color: 'var(--accent)' }} />
              <h3 style={{ margin: 0, fontFamily: 'Cinzel, serif', fontSize: '1.25rem', color: 'var(--ink)' }}>
                {masterScene.title}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="action-btn-secondary"
                onClick={handleRollMasterScene}
                style={{ fontSize: '0.76rem', padding: '4px 8px', gap: '4px' }}
                title="Roll another master scene"
              >
                <Dices size={13} />
                <span>Re-Roll Scene</span>
              </button>
              <button
                className="action-btn-primary"
                onClick={() => {
                  const body = `Protagonist: ${masterScene.protagonist}\n\nCatalyst: ${masterScene.catalyst}\n\nSetting & Threat: ${masterScene.threat}\n\nTwist: ${masterScene.twist}\n\nStakes: ${masterScene.stakes}`;
                  onAddCardToStoryboard('beat', masterScene.title, body, { tag: 'Muse · Master Scene', width: 320 });
                  showToast('Added full scene spark to Storyboard!');
                }}
                style={{ fontSize: '0.76rem', padding: '4px 10px', gap: '4px' }}
              >
                <Send size={13} />
                <span>To Storyboard</span>
              </button>
              <button
                className="icon-btn"
                onClick={() => setMasterScene(null)}
                title="Close scene banner"
                style={{ color: 'var(--muted)' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', fontSize: '0.85rem' }}>
            <div style={{ background: 'var(--bg)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--line)' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: '3px' }}>
                👤 Point of View / Protagonist
              </span>
              <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{masterScene.protagonist}</span>
            </div>

            <div style={{ background: 'var(--bg)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--line)' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#047857', display: 'block', marginBottom: '3px' }}>
                ⚡ Inciting Catalyst
              </span>
              <span style={{ color: 'var(--ink)' }}>{masterScene.catalyst}</span>
            </div>

            <div style={{ background: 'var(--bg)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--line)' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#b91c1c', display: 'block', marginBottom: '3px' }}>
                🌪️ Atmospheric Threat
              </span>
              <span style={{ color: 'var(--ink)' }}>{masterScene.threat}</span>
            </div>

            <div style={{ background: 'var(--bg)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--line)' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#7c3aed', display: 'block', marginBottom: '3px' }}>
                🔄 Narrative Twist
              </span>
              <span style={{ color: 'var(--ink)', fontStyle: 'italic' }}>"{masterScene.twist}"</span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8 PROCEDURAL CATEGORY GENERATOR CARDS                         */}
      {/* ------------------------------------------------------------- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '22px' }}>
        {/* CARD 1: CHARACTER & CORE WOUND */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '22px', borderLeft: '4px solid #B0567A' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={15} style={{ color: '#B0567A' }} />
                <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: '#B0567A' }}>
                  Character & Core Wound
                </span>
              </div>
              <button
                className="icon-btn"
                onClick={() => setCharSpark(generateCharacter(selectedGenre))}
                title="Roll new character"
              >
                <Dices size={16} />
              </button>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.45rem', fontWeight: 700, color: 'var(--ink)' }}>
                  {charSpark.name}
                </span>
                <span style={{ fontSize: '0.84rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                  {charSpark.epithet}
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
                {charSpark.archetype}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', marginTop: '12px' }}>
              <div>
                <strong style={{ color: '#b91c1c' }}>Wound: </strong>
                <span style={{ color: 'var(--muted)' }}>{charSpark.wound}</span>
              </div>
              <div>
                <strong style={{ color: '#c2410c' }}>The Lie: </strong>
                <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>{charSpark.lie}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--accent)' }}>Want vs Need: </strong>
                <span style={{ color: 'var(--muted)' }}>Wants to {charSpark.want.toLowerCase()} but needs to {charSpark.need.toLowerCase()}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--ink)' }}>Quirk: </strong>
                <span style={{ color: 'var(--muted)' }}>{charSpark.quirk}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
            <button
              className="action-btn-secondary"
              onClick={() => copyToClipboard(`${charSpark.name} ${charSpark.epithet} - ${charSpark.archetype}\nWound: ${charSpark.wound}\nLie: ${charSpark.lie}\nWant: ${charSpark.want}`, 'char')}
              style={{ flex: 1, fontSize: '0.74rem', padding: '4px' }}
            >
              {copiedKey === 'char' ? <Check size={12} /> : <Copy size={12} />}
              <span>Copy</span>
            </button>
            <button
              className="action-btn-primary"
              onClick={() => {
                const charId = onAddCharacter
                  ? onAddCharacter({
                      name: `${charSpark.name} ${charSpark.epithet}`,
                      role: 'supporting',
                      archetype: charSpark.archetype,
                      wound: charSpark.wound,
                      lie: charSpark.lie,
                      want: charSpark.want,
                      need: charSpark.need,
                      traits: [charSpark.quirk],
                      notes: `Signature Item: ${charSpark.signatureItem}`,
                      entityKind: 'character',
                    })
                  : undefined;

                const body = [
                  `Archetype: ${charSpark.archetype}`,
                  `Deep Wound: ${charSpark.wound}`,
                  `The Lie: ${charSpark.lie}`,
                  `Want: ${charSpark.want}`,
                  `Need: ${charSpark.need}`,
                  `Quirk: ${charSpark.quirk}`,
                  `Signature Gear: ${charSpark.signatureItem}`,
                ].join('\n\n');

                onAddCardToStoryboard('character', `${charSpark.name} ${charSpark.epithet}`, body, {
                  characterId: typeof charId === 'string' ? charId : undefined,
                  tag: 'Muse · Character',
                  width: 280,
                });
                showToast(`Sent ${charSpark.name} to Storyboard!`);
              }}
              style={{ flex: 1, fontSize: '0.74rem', padding: '4px' }}
            >
              <Send size={12} />
              <span>Storyboard</span>
            </button>
            {onAddCharacter && (
              <button
                className="action-btn-secondary"
                onClick={() => {
                  onAddCharacter({
                    name: charSpark.name,
                    role: 'supporting',
                    archetype: charSpark.archetype,
                    wound: charSpark.wound,
                    lie: charSpark.lie,
                    want: charSpark.want,
                    need: charSpark.need,
                    traits: [charSpark.quirk],
                    notes: `Signature Gear: ${charSpark.signatureItem}`,
                    entityKind: 'character',
                  });
                  showToast(`Added ${charSpark.name} to Characters!`);
                  if (onNavigate) onNavigate('characters');
                }}
                style={{ fontSize: '0.74rem', padding: '4px 8px', color: '#B0567A' }}
                title="Create directly in Character Builder"
              >
                + To Cast
              </button>
            )}
          </div>
        </div>

        {/* CARD 2: MONSTER & ADVERSARY */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '22px', borderLeft: '4px solid #dc2626' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Skull size={15} style={{ color: '#dc2626' }} />
                <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: '#dc2626' }}>
                  Monster & Adversary
                </span>
              </div>
              <button
                className="icon-btn"
                onClick={() => setMonsterSpark(generateMonster(selectedGenre))}
                title="Roll new monster"
              >
                <Dices size={16} />
              </button>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.45rem', fontWeight: 700, color: 'var(--ink)' }}>
                  {monsterSpark.name}
                </span>
                <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(239,68,68,0.15)', color: '#dc2626', fontWeight: 700 }}>
                  {monsterSpark.dangerLevel}
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                {monsterSpark.nature}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', marginTop: '10px' }}>
              <div>
                <strong style={{ color: '#b91c1c' }}>Terrifying Ability: </strong>
                <span style={{ color: 'var(--muted)' }}>{monsterSpark.ability}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--accent)' }}>Lair / Domain: </strong>
                <span style={{ color: 'var(--muted)' }}>{monsterSpark.lair}</span>
              </div>
              <div>
                <strong style={{ color: '#047857' }}>Fatal Flaw / Weakness: </strong>
                <span style={{ color: 'var(--muted)' }}>{monsterSpark.weakness}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
            <button
              className="action-btn-secondary"
              onClick={() => copyToClipboard(`${monsterSpark.name}\n${monsterSpark.nature}\nAbility: ${monsterSpark.ability}\nWeakness: ${monsterSpark.weakness}`, 'mon')}
              style={{ flex: 1, fontSize: '0.74rem', padding: '4px' }}
            >
              {copiedKey === 'mon' ? <Check size={12} /> : <Copy size={12} />}
              <span>Copy</span>
            </button>
            <button
              className="action-btn-primary"
              onClick={() => {
                const monId = onAddCharacter
                  ? onAddCharacter({
                      name: monsterSpark.name,
                      role: 'antagonist',
                      archetype: monsterSpark.dangerLevel,
                      notes: `${monsterSpark.nature}\n\nAbility: ${monsterSpark.ability}\nLair: ${monsterSpark.lair}\nWeakness: ${monsterSpark.weakness}`,
                      entityKind: 'monster',
                    })
                  : undefined;

                const body = [
                  `Threat Level: ${monsterSpark.dangerLevel}`,
                  `Nature: ${monsterSpark.nature}`,
                  `Terrifying Ability: ${monsterSpark.ability}`,
                  `Lair / Domain: ${monsterSpark.lair}`,
                  `Fatal Flaw / Weakness: ${monsterSpark.weakness}`,
                ].join('\n\n');

                onAddCardToStoryboard('monster', monsterSpark.name, body, {
                  characterId: typeof monId === 'string' ? monId : undefined,
                  tag: 'Muse · Monster',
                  width: 280,
                });
                showToast(`Sent ${monsterSpark.name} to Storyboard!`);
              }}
              style={{ flex: 1, fontSize: '0.74rem', padding: '4px' }}
            >
              <Send size={12} />
              <span>Storyboard</span>
            </button>
            {onAddCharacter && (
              <button
                className="action-btn-secondary"
                onClick={() => {
                  onAddCharacter({
                    name: monsterSpark.name,
                    role: 'antagonist',
                    archetype: monsterSpark.dangerLevel,
                    notes: `${monsterSpark.nature}\n\nLair: ${monsterSpark.lair}\nAbility: ${monsterSpark.ability}\nWeakness: ${monsterSpark.weakness}`,
                    entityKind: 'monster',
                  });
                  showToast(`Added ${monsterSpark.name} to Bestiary!`);
                  if (onNavigate) onNavigate('characters');
                }}
                style={{ fontSize: '0.74rem', padding: '4px 8px', color: '#dc2626' }}
                title="Create directly in Bestiary"
              >
                + To Bestiary
              </button>
            )}
          </div>
        </div>

        {/* CARD 3: INCITING HOOK & CLOCK */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '22px', borderLeft: '4px solid #8a5cc0' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={15} style={{ color: '#8a5cc0' }} />
                <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: '#8a5cc0' }}>
                  Inciting Hook & Ticking Clock
                </span>
              </div>
              <button
                className="icon-btn"
                onClick={() => setHookSpark(generateHook(selectedGenre))}
                title="Roll new hook"
              >
                <Dices size={16} />
              </button>
            </div>

            <h4 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 8px 0' }}>
              {hookSpark.title}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <div style={{ color: 'var(--ink)', fontWeight: 500, lineHeight: 1.45 }}>
                {hookSpark.incitingEvent}
              </div>
              <div style={{ color: 'var(--muted)', background: 'var(--bg)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--line)' }}>
                <strong style={{ color: '#c2410c' }}>Ticking Clock: </strong>
                {hookSpark.tickingClock}
              </div>
              <div>
                <strong style={{ color: '#b91c1c' }}>Hidden Threat: </strong>
                <span style={{ color: 'var(--muted)' }}>{hookSpark.hiddenStakes}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
            <button
              className="action-btn-secondary"
              onClick={() => copyToClipboard(`${hookSpark.title}\n${hookSpark.incitingEvent}\nClock: ${hookSpark.tickingClock}\nStakes: ${hookSpark.hiddenStakes}`, 'hook')}
              style={{ flex: 1, fontSize: '0.74rem' }}
            >
              {copiedKey === 'hook' ? <Check size={12} /> : <Copy size={12} />}
              <span>Copy</span>
            </button>
            <button
              className="action-btn-primary"
              onClick={() => {
                const body = [
                  `Inciting Event: ${hookSpark.incitingEvent}`,
                  `Ticking Clock: ${hookSpark.tickingClock}`,
                  `Hidden Threat: ${hookSpark.hiddenStakes}`,
                ].join('\n\n');
                onAddCardToStoryboard('beat', hookSpark.title, body, {
                  tag: 'Muse · Hook',
                  width: 280,
                });
                showToast(`Sent hook to Storyboard!`);
              }}
              style={{ flex: 1, fontSize: '0.74rem' }}
            >
              <Send size={12} />
              <span>To Storyboard</span>
            </button>
          </div>
        </div>

        {/* CARD 4: PLOT TWIST & COMPLICATION */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '22px', borderLeft: '4px solid #a3432b' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={15} style={{ color: '#a3432b' }} />
                <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: '#a3432b' }}>
                  Narrative Twist & Complication
                </span>
              </div>
              <button
                className="icon-btn"
                onClick={() => setTwistSpark(generateTwist(selectedGenre))}
                title="Roll new twist"
              >
                <Dices size={16} />
              </button>
            </div>

            <h4 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 8px 0' }}>
              {twistSpark.title}
            </h4>

            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', color: 'var(--ink)', fontStyle: 'italic', lineHeight: 1.5, margin: '0 0 10px 0' }}>
              "{twistSpark.twist}"
            </p>

            <div style={{ background: 'var(--bg)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.8rem' }}>
              <strong style={{ color: 'var(--accent)' }}>Consequence: </strong>
              <span style={{ color: 'var(--muted)' }}>{twistSpark.implication}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
            <button
              className="action-btn-secondary"
              onClick={() => copyToClipboard(`${twistSpark.title}: ${twistSpark.twist}\nImplication: ${twistSpark.implication}`, 'twist')}
              style={{ flex: 1, fontSize: '0.74rem' }}
            >
              {copiedKey === 'twist' ? <Check size={12} /> : <Copy size={12} />}
              <span>Copy</span>
            </button>
            <button
              className="action-btn-primary"
              onClick={() => {
                const body = [
                  `The Twist: ${twistSpark.twist}`,
                  `Dramatic Consequence: ${twistSpark.implication}`,
                ].join('\n\n');
                onAddCardToStoryboard('beat', twistSpark.title, body, {
                  tag: 'Muse · Twist',
                  width: 280,
                });
                showToast(`Sent twist to Storyboard!`);
              }}
              style={{ flex: 1, fontSize: '0.74rem' }}
            >
              <Send size={12} />
              <span>To Storyboard</span>
            </button>
          </div>
        </div>

        {/* CARD 5: SETTING & LANDMARK */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '22px', borderLeft: '4px solid #3E7A8C' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Compass size={15} style={{ color: '#3E7A8C' }} />
                <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: '#3E7A8C' }}>
                  Setting & Landmark
                </span>
              </div>
              <button
                className="icon-btn"
                onClick={() => setPlaceSpark(generatePlace(selectedGenre))}
                title="Roll new setting"
              >
                <Dices size={16} />
              </button>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink)' }}>
                {placeSpark.name}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
              <div>
                <strong style={{ color: 'var(--accent)' }}>Landmark: </strong>
                <span style={{ color: 'var(--muted)' }}>{placeSpark.feature}</span>
              </div>
              <div>
                <strong style={{ color: '#047857' }}>Atmosphere: </strong>
                <span style={{ color: 'var(--muted)' }}>{placeSpark.sensory}</span>
              </div>
              <div>
                <strong style={{ color: '#b91c1c' }}>Peril: </strong>
                <span style={{ color: 'var(--muted)' }}>{placeSpark.hazard}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
            <button
              className="action-btn-secondary"
              onClick={() => copyToClipboard(`${placeSpark.name}\nFeature: ${placeSpark.feature}\nAtmosphere: ${placeSpark.sensory}`, 'place')}
              style={{ flex: 1, fontSize: '0.74rem', padding: '4px' }}
            >
              {copiedKey === 'place' ? <Check size={12} /> : <Copy size={12} />}
              <span>Copy</span>
            </button>
            <button
              className="action-btn-primary"
              onClick={() => {
                const body = [
                  `Landmark Type: ${placeSpark.descriptor}`,
                  `Dominant Feature: ${placeSpark.feature}`,
                  `Atmosphere: ${placeSpark.sensory}`,
                  `Peril: ${placeSpark.hazard}`,
                ].join('\n\n');
                onAddCardToStoryboard('place', placeSpark.name, body, {
                  tag: 'Muse · Landmark',
                  width: 280,
                });
                showToast(`Sent ${placeSpark.name} to Storyboard!`);
              }}
              style={{ flex: 1, fontSize: '0.74rem', padding: '4px' }}
            >
              <Send size={12} />
              <span>Storyboard</span>
            </button>
            {onAddStampToMap && (
              <button
                className="action-btn-secondary"
                onClick={() => {
                  const stampType = inferStampType(placeSpark.name, placeSpark.descriptor);
                  onAddStampToMap({
                    label: placeSpark.name,
                    type: stampType,
                    feature: placeSpark.feature,
                    sensory: placeSpark.sensory,
                    hazard: placeSpark.hazard,
                    description: placeSpark.descriptor,
                    lore: `${placeSpark.descriptor}\n\nAtmosphere: ${placeSpark.sensory}\nPeril: ${placeSpark.hazard}`,
                  });
                  showToast(`Added ${placeSpark.name} to Map Maker!`);
                  if (onNavigate) onNavigate('maps');
                }}
                style={{ fontSize: '0.74rem', padding: '4px 8px', color: '#3E7A8C' }}
                title="Add as stamp with full details to Map Maker"
              >
                + To Map
              </button>
            )}
          </div>
        </div>

        {/* CARD 6: RELIC & ODDITY */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '22px', borderLeft: '4px solid #BA7517' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={15} style={{ color: '#BA7517' }} />
                <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: '#BA7517' }}>
                  Relic & Arcane Oddity
                </span>
              </div>
              <button
                className="icon-btn"
                onClick={() => setRelicSpark(generateRelic(selectedGenre))}
                title="Roll new relic"
              >
                <Dices size={16} />
              </button>
            </div>

            <h4 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 6px 0' }}>
              {relicSpark.name}
            </h4>

            <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: 'var(--muted)', fontStyle: 'italic' }}>
              {relicSpark.appearance}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
              <div>
                <strong style={{ color: 'var(--good)' }}>Wondrous Power: </strong>
                <span style={{ color: 'var(--ink)' }}>{relicSpark.power}</span>
              </div>
              <div>
                <strong style={{ color: '#b91c1c' }}>Terrible Price: </strong>
                <span style={{ color: 'var(--muted)' }}>{relicSpark.cost}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
            <button
              className="action-btn-secondary"
              onClick={() => copyToClipboard(`${relicSpark.name}\n${relicSpark.appearance}\nPower: ${relicSpark.power}\nCost: ${relicSpark.cost}`, 'relic')}
              style={{ flex: 1, fontSize: '0.74rem' }}
            >
              {copiedKey === 'relic' ? <Check size={12} /> : <Copy size={12} />}
              <span>Copy</span>
            </button>
            <button
              className="action-btn-primary"
              onClick={() => {
                const body = [
                  `Appearance: ${relicSpark.appearance}`,
                  `Wondrous Power: ${relicSpark.power}`,
                  `Terrible Price / Curse: ${relicSpark.cost}`,
                ].join('\n\n');
                onAddCardToStoryboard('idea', relicSpark.name, body, {
                  tag: 'Muse · Relic',
                  width: 280,
                });
                showToast(`Sent relic to Storyboard!`);
              }}
              style={{ flex: 1, fontSize: '0.74rem' }}
            >
              <Send size={12} />
              <span>To Storyboard</span>
            </button>
          </div>
        </div>

        {/* CARD 7: MORAL DILEMMA */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '22px', borderLeft: '4px solid #1D9E75' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Scale size={15} style={{ color: '#1D9E75' }} />
                <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: '#1D9E75' }}>
                  Moral Dilemma & Impossible Choice
                </span>
              </div>
              <button
                className="icon-btn"
                onClick={() => setDilemmaSpark(generateDilemma())}
                title="Roll new dilemma"
              >
                <Dices size={16} />
              </button>
            </div>

            <h4 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 6px 0' }}>
              {dilemmaSpark.title}
            </h4>

            <p style={{ margin: '0 0 10px 0', fontSize: '0.84rem', color: 'var(--ink)', lineHeight: 1.45 }}>
              {dilemmaSpark.situation}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
              <div style={{ background: 'var(--bg)', padding: '6px 8px', borderRadius: '5px', border: '1px solid var(--line)' }}>
                <strong style={{ color: '#b91c1c' }}>Option A: </strong>
                <span style={{ color: 'var(--muted)' }}>{dilemmaSpark.choiceA}</span>
              </div>
              <div style={{ background: 'var(--bg)', padding: '6px 8px', borderRadius: '5px', border: '1px solid var(--line)' }}>
                <strong style={{ color: '#c2410c' }}>Option B: </strong>
                <span style={{ color: 'var(--muted)' }}>{dilemmaSpark.choiceB}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
            <button
              className="action-btn-secondary"
              onClick={() => copyToClipboard(`${dilemmaSpark.title}\nSituation: ${dilemmaSpark.situation}\nA: ${dilemmaSpark.choiceA}\nB: ${dilemmaSpark.choiceB}`, 'dilemma')}
              style={{ flex: 1, fontSize: '0.74rem' }}
            >
              {copiedKey === 'dilemma' ? <Check size={12} /> : <Copy size={12} />}
              <span>Copy</span>
            </button>
            <button
              className="action-btn-primary"
              onClick={() => {
                const body = [
                  `The Crisis: ${dilemmaSpark.situation}`,
                  `Option A: ${dilemmaSpark.choiceA}`,
                  `Option B: ${dilemmaSpark.choiceB}`,
                ].join('\n\n');
                onAddCardToStoryboard('idea', dilemmaSpark.title, body, {
                  tag: 'Muse · Dilemma',
                  width: 280,
                });
                showToast(`Sent dilemma to Storyboard!`);
              }}
              style={{ flex: 1, fontSize: '0.74rem' }}
            >
              <Send size={12} />
              <span>To Storyboard</span>
            </button>
          </div>
        </div>

        {/* CARD 8: DIALOGUE SPARKS */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '22px', borderLeft: '4px solid #467B92' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={15} style={{ color: '#467B92' }} />
                <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: '#467B92' }}>
                  Dialogue Spark & Sharp Opener
                </span>
              </div>
              <button
                className="icon-btn"
                onClick={() => setDialogueSpark(generateDialogue())}
                title="Roll new dialogue"
              >
                <Dices size={16} />
              </button>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>
                {dialogueSpark.speaker} · {dialogueSpark.context}
              </span>
            </div>

            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', color: 'var(--ink)', fontStyle: 'italic', lineHeight: 1.5, margin: '8px 0 0 0' }}>
              {dialogueSpark.quote}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
            <button
              className="action-btn-secondary"
              onClick={() => copyToClipboard(`${dialogueSpark.speaker} (${dialogueSpark.context}): ${dialogueSpark.quote}`, 'dialogue')}
              style={{ flex: 1, fontSize: '0.74rem' }}
            >
              {copiedKey === 'dialogue' ? <Check size={12} /> : <Copy size={12} />}
              <span>Copy</span>
            </button>
            <button
              className="action-btn-primary"
              onClick={() => {
                const body = [
                  `“${dialogueSpark.quote}”`,
                  `Speaker: ${dialogueSpark.speaker}`,
                  `Context: ${dialogueSpark.context}`,
                ].join('\n\n');
                onAddCardToStoryboard('beat', `Quote: ${dialogueSpark.speaker}`, body, {
                  tag: 'Muse · Dialogue',
                  width: 280,
                });
                showToast(`Sent dialogue hook to Storyboard!`);
              }}
              style={{ flex: 1, fontSize: '0.74rem' }}
            >
              <Send size={12} />
              <span>To Storyboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
