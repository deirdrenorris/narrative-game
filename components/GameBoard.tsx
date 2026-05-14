'use client';

import { useState, useEffect, useRef } from 'react';

interface GameBoardProps {
  narration: string;
  choices: string[];
  loading: boolean;
  onChoice: (choice: string) => void;
  tombstone?: string;
}

export default function GameBoard({
  narration,
  choices,
  loading,
  onChoice,
  tombstone,
}: GameBoardProps) {
  const [customInput, setCustomInput] = useState('');
  const [showTombstone, setShowTombstone] = useState(false);
  const prevTombstone = useRef<string | undefined>(undefined);
  const narrationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tombstone && tombstone !== prevTombstone.current) {
      setShowTombstone(true);
      prevTombstone.current = tombstone;
      const timer = setTimeout(() => setShowTombstone(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [tombstone]);

  // Scroll narration into view when it updates
  useEffect(() => {
    narrationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [narration]);

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed || loading) return;
    setCustomInput('');
    onChoice(trimmed);
  }

  return (
    <div className="game-board">
      {/* Tombstone overlay */}
      {showTombstone && tombstone && (
        <div className="tombstone-overlay">
          <div className="tombstone-stone">
            <p className="tombstone-cross">✝</p>
            <p className="tombstone-text">{tombstone}</p>
          </div>
        </div>
      )}

      {/* Narration panel */}
      <div className="narration-panel" ref={narrationRef}>
        <div className="narration-border">
          {loading ? (
            <div className="loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
          ) : (
            <div className="narration-text">
              {narration.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Choice prompt + buttons */}
      {!loading && choices.length > 0 && (
        <div className="choices-section">
          <div className="choices-header">
            <span className="choices-arrow">▶</span>
            <span className="choices-prompt">What do you do?</span>
            <span className="choices-hint">Choose one — or write your own below</span>
          </div>
          <div className="choices">
            {choices.map((choice, i) => (
              <button
                key={i}
                className="choice-btn"
                onClick={() => onChoice(choice)}
                disabled={loading}
              >
                <span className="choice-number">{i + 1}.</span> {choice}
              </button>
            ))}
          </div>
          <form className="custom-input-form" onSubmit={handleCustomSubmit}>
            <input
              type="text"
              className="custom-input"
              placeholder="Write your own action..."
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              disabled={loading}
              maxLength={200}
            />
            <button type="submit" className="custom-submit" disabled={loading || !customInput.trim()}>
              Go
            </button>
          </form>
        </div>
      )}

      {/* Free-text only while loading is done but no choices yet (shouldn't happen, safety) */}
      {!loading && choices.length === 0 && (
        <form className="custom-input-form" onSubmit={handleCustomSubmit}>
          <input
            type="text"
            className="custom-input"
            placeholder="What do you do?"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            disabled={loading}
            maxLength={200}
          />
          <button type="submit" className="custom-submit" disabled={loading || !customInput.trim()}>
            Go
          </button>
        </form>
      )}
    </div>
  );
}
