'use client';

import { useState } from 'react';
import { GameState, GameResponse, createInitialState } from '@/lib/gameState';
import GameBoard from '@/components/GameBoard';
import StatusBar from '@/components/StatusBar';

const OPENING_NARRATION = `The morning air smells of river mud and possibility. It is May 1st, 1848, and the wagon town of Independence, Missouri hums with the chaotic energy of a thousand souls about to do something irreversible. Your party — Eleanor, Thomas, young Clara, and the quietly capable Josiah — stand beside your loaded wagon, watching the first groups of emigrants file westward into the endless green prairie.

The trail agent tips his hat and hands you a battered pamphlet: "Two thousand miles to Oregon City. Good luck." Clara tugs at your sleeve and points at the horizon, where the grass bends in waves like the surface of some enormous, indifferent sea. It is time to go.`;

const OPENING_CHOICES = [
  'Set out at a steady pace',
  'Spend the day buying more supplies',
  'Talk to other emigrants first',
  'Study the map carefully before leaving',
];

export default function HomePage() {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [narration, setNarration] = useState(OPENING_NARRATION);
  const [choices, setChoices] = useState(OPENING_CHOICES);
  const [tombstone, setTombstone] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChoice(choice: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: gameState, choice }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Unknown error');
      }

      const data: GameResponse = await res.json();
      setGameState(data.state);
      setNarration(data.narration);
      setChoices(data.choices);
      setTombstone(data.tombstone);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong on the trail.');
    } finally {
      setLoading(false);
    }
  }

  function resetGame() {
    setGameState(createInitialState());
    setNarration(OPENING_NARRATION);
    setChoices(OPENING_CHOICES);
    setTombstone(undefined);
    setError(null);
  }

  if (gameState.gameOver) {
    return (
      <div className="end-screen">
        <div className="end-inner">
          <h1 className="end-title">{gameState.won ? 'You Reached Oregon!' : 'The Trail Has Claimed You'}</h1>
          <div className="end-narration">
            <p>{narration}</p>
          </div>
          {gameState.gameOverReason && (
            <p className="end-reason">{gameState.gameOverReason}</p>
          )}
          <div className="end-stats">
            <p>Miles traveled: {gameState.milesFromStart}</p>
            <p>Days on trail: {gameState.dayNumber}</p>
            <p>Survivors: {gameState.party.filter(m => m.health !== 'dead').map(m => m.name).join(', ') || 'None'}</p>
          </div>
          <button className="choice-btn" onClick={resetGame}>
            Begin Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-layout">
      <header className="game-header">
        <h1 className="game-title">The Long Road West</h1>
        <p className="game-subtitle">Oregon Trail · 1848</p>
        <p className="game-instructions">An interactive story — read each scene, then pick a choice or write your own action to shape what happens next.</p>
      </header>

      <main className="game-main">
        <div className="game-content">
          <GameBoard
            narration={narration}
            choices={choices}
            loading={loading}
            onChoice={handleChoice}
            tombstone={tombstone}
          />
        </div>
        <StatusBar state={gameState} />
      </main>

      {error && (
        <div className="error-banner">
          Trail error: {error}
        </div>
      )}
    </div>
  );
}
