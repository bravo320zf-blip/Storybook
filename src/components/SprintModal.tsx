import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, X, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTotalWords: number;
}

export const SprintModal: React.FC<SprintModalProps> = ({
  isOpen,
  onClose,
  currentTotalWords,
}) => {
  const [duration, setDuration] = useState<number>(15); // minutes
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [startWords, setStartWords] = useState<number>(currentTotalWords);
  const [completed, setCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setStartWords(currentTotalWords);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      setCompleted(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  if (!isOpen) return null;

  const wordsWritten = Math.max(0, currentTotalWords - startWords);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  const handleSelectDuration = (m: number) => {
    setDuration(m);
    setTimeLeft(m * 60);
    setIsRunning(false);
    setCompleted(false);
  };

  const handleReset = () => {
    setTimeLeft(duration * 60);
    setIsRunning(false);
    setCompleted(false);
    setStartWords(currentTotalWords);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: '440px', textAlign: 'center' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Timer size={18} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.25rem' }}>Writing Sprint</h3>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '32px 24px' }}>
          {/* Duration selectors */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
            {[5, 15, 25].map((m) => (
              <button
                key={m}
                className={`chip ${duration === m ? 'active' : ''}`}
                onClick={() => handleSelectDuration(m)}
                disabled={isRunning}
              >
                {m} Minutes
              </button>
            ))}
          </div>

          {/* Big countdown clock */}
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '3.8rem',
              fontWeight: 700,
              color: 'var(--ink)',
              margin: '12px 0',
              letterSpacing: '0.04em',
            }}
          >
            {timeFormatted}
          </div>

          {/* Words tracker */}
          <div style={{ margin: '18px 0', fontSize: '1.05rem', color: 'var(--muted)' }}>
            <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.4rem' }}>
              {wordsWritten}
            </span>{' '}
            words written this sprint
          </div>

          {completed && (
            <div
              style={{
                background: 'rgba(76, 116, 68, 0.12)',
                border: '1px solid var(--good)',
                borderRadius: '8px',
                padding: '12px',
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'var(--good)',
                fontWeight: 600,
              }}
            >
              <Award size={18} />
              <span>Sprint finished! Incredible focus.</span>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center', gap: '14px' }}>
          <button
            className="action-btn-primary"
            onClick={() => setIsRunning(!isRunning)}
            style={{ minWidth: '120px', justifyContent: 'center' }}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            <span>{isRunning ? 'Pause' : 'Start Sprint'}</span>
          </button>
          <button className="action-btn-secondary" onClick={handleReset}>
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
