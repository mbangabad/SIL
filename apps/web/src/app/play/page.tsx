/**
 * Game Selection Page
 *
 * Displays all available games and allows users to select one to play
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ALL_GAMES, getGameById } from '@sil/games';
import type { GameMode } from '@sil/core';

const GAME_TIERS = {
  original: 'Original Games',
  tierA: 'Tier A: Semantic Foundation',
  tierB: 'Tier B: Advanced Semantics',
  tierC: 'Tier C: Expert Semantics',
};

const ORIGINAL_GAME_IDS = ['grip', 'zero', 'ping', 'span', 'cluster', 'colorglyph', 'trace', 'flow', 'tensor', 'splice', 'one', 'loop'];
const TIER_A_IDS = ['tribes', 'echochain', 'ghost', 'motif', 'flock'];
const TIER_B_IDS = ['merge', 'pivotword', 'radial', 'traceword', 'shard'];
const TIER_C_IDS = ['spoke', 'warpword', 'vector'];

export default function PlayPage() {
  const [selectedMode, setSelectedMode] = useState<GameMode>('oneShot');

  const gamesByTier = {
    original: ALL_GAMES.filter(g => ORIGINAL_GAME_IDS.includes(g.id)),
    tierA: ALL_GAMES.filter(g => TIER_A_IDS.includes(g.id)),
    tierB: ALL_GAMES.filter(g => TIER_B_IDS.includes(g.id)),
    tierC: ALL_GAMES.filter(g => TIER_C_IDS.includes(g.id)),
  };

  return (
    <div className="play-page">
      <div className="container">
        <header className="header">
          <h1 className="title">Semantic Intelligence League</h1>
          <p className="subtitle">Choose your game and test your semantic intelligence</p>
        </header>

        {/* Mode selector */}
        <div className="mode-selector">
          <h2 className="mode-title">Game Mode</h2>
          <div className="mode-buttons">
            <button
              className={`mode-button ${selectedMode === 'oneShot' ? 'active' : ''}`}
              onClick={() => setSelectedMode('oneShot')}
            >
              <span className="mode-name">One-Shot</span>
              <span className="mode-desc">Single round</span>
            </button>
            <button
              className={`mode-button ${selectedMode === 'journey' ? 'active' : ''}`}
              onClick={() => setSelectedMode('journey')}
            >
              <span className="mode-name">Journey</span>
              <span className="mode-desc">5 rounds</span>
            </button>
            <button
              className={`mode-button ${selectedMode === 'arena' ? 'active' : ''}`}
              onClick={() => setSelectedMode('arena')}
            >
              <span className="mode-name">Arena</span>
              <span className="mode-desc">Competitive</span>
            </button>
            <button
              className={`mode-button ${selectedMode === 'endurance' ? 'active' : ''}`}
              onClick={() => setSelectedMode('endurance')}
            >
              <span className="mode-name">Endurance</span>
              <span className="mode-desc">Multi-game</span>
            </button>
          </div>
        </div>

        {/* Game grid by tier */}
        {Object.entries(gamesByTier).map(([tier, games]) => (
          <section key={tier} className="tier-section">
            <h2 className="tier-title">{GAME_TIERS[tier as keyof typeof GAME_TIERS]}</h2>
            <div className="game-grid">
              {games.map((game) => {
                const supportsMode = game.supportedModes.includes(selectedMode);

                return (
                  <Link
                    key={game.id}
                    href={supportsMode ? `/play/${game.id}?mode=${selectedMode}` : '#'}
                    className={`game-card ${!supportsMode ? 'disabled' : ''}`}
                  >
                    <div className="game-card-header">
                      <h3 className="game-name">{game.name}</h3>
                      {!supportsMode && (
                        <span className="unsupported-badge">Mode unavailable</span>
                      )}
                    </div>
                    <p className="game-description">{game.shortDescription}</p>
                    <div className="game-modes">
                      {game.supportedModes.map((mode) => (
                        <span
                          key={mode}
                          className={`mode-badge ${mode === selectedMode ? 'active' : ''}`}
                        >
                          {mode}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <style jsx>{`
        .play-page {
          min-height: 100vh;
          background: linear-gradient(to bottom, #f8fafc, #e2e8f0);
          padding: 2rem 1rem;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .title {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          font-size: 1.25rem;
          color: #64748b;
        }

        .mode-selector {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 3rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .mode-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1e293b;
        }

        .mode-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .mode-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mode-button:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .mode-button.active {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
        }

        .mode-name {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .mode-desc {
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .tier-section {
          margin-bottom: 3rem;
        }

        .tier-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1.5rem;
        }

        .game-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .game-card {
          display: block;
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
        }

        .game-card:hover:not(.disabled) {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(59, 130, 246, 0.15);
        }

        .game-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .game-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .game-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .unsupported-badge {
          font-size: 0.75rem;
          color: #ef4444;
          background: #fee2e2;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .game-description {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .game-modes {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .mode-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background: #f1f5f9;
          color: #64748b;
        }

        .mode-badge.active {
          background: #dbeafe;
          color: #3b82f6;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
