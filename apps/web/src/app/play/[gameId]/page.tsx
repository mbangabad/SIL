/**
 * Individual Game Play Page
 *
 * Dynamic route for playing any SIL game
 * Route: /play/[gameId]?mode=oneShot
 */

'use client';

import React from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getGameById } from '@sil/games';
import type { GameMode } from '@sil/core';
import { useGameSession } from '../../../hooks/useGameSession';
import { GameRenderer } from '../../../components/GameRenderer';
import { SummaryCard } from '@sil/ui';

export default function GamePlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const gameId = params.gameId as string;
  const mode = (searchParams.get('mode') as GameMode) || 'oneShot';

  // Get game definition
  const game = getGameById(gameId);

  // Use game session hook
  const {
    gameState,
    isLoading,
    error,
    summary,
    isGameOver,
    currentStep,
    submitAction,
    resetGame,
  } = useGameSession({
    game: game!,
    mode,
    userId: 'demo-user', // TODO: Get from auth context
  });

  // Handle game not found
  if (!game) {
    return (
      <div className="error-page">
        <div className="error-container">
          <h1 className="error-title">Game Not Found</h1>
          <p className="error-message">
            The game "{gameId}" does not exist.
          </p>
          <button
            onClick={() => router.push('/play')}
            className="back-button"
          >
            Back to Games
          </button>
        </div>

        <style jsx>{`
          .error-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }

          .error-container {
            text-align: center;
          }

          .error-title {
            font-size: 2rem;
            font-weight: 700;
            color: #ef4444;
            margin-bottom: 1rem;
          }

          .error-message {
            font-size: 1rem;
            color: #64748b;
            margin-bottom: 2rem;
          }

          .back-button {
            padding: 0.75rem 1.5rem;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .back-button:hover {
            background: #2563eb;
          }
        `}</style>
      </div>
    );
  }

  // Check if game supports mode
  if (!game.supportedModes.includes(mode)) {
    return (
      <div className="error-page">
        <div className="error-container">
          <h1 className="error-title">Mode Not Supported</h1>
          <p className="error-message">
            {game.name} does not support {mode} mode.
          </p>
          <p className="error-message">
            Supported modes: {game.supportedModes.join(', ')}
          </p>
          <button
            onClick={() => router.push('/play')}
            className="back-button"
          >
            Back to Games
          </button>
        </div>

        <style jsx>{`
          .error-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }

          .error-container {
            text-align: center;
          }

          .error-title {
            font-size: 2rem;
            font-weight: 700;
            color: #ef4444;
            margin-bottom: 1rem;
          }

          .error-message {
            font-size: 1rem;
            color: #64748b;
            margin-bottom: 1rem;
          }

          .back-button {
            padding: 0.75rem 1.5rem;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 1rem;
          }

          .back-button:hover {
            background: #2563eb;
          }
        `}</style>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading {game.name}...</p>

        <style jsx>{`
          .loading-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
          }

          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #e2e8f0;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .loading-text {
            font-size: 1rem;
            color: #64748b;
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-page">
        <div className="error-container">
          <h1 className="error-title">Error</h1>
          <p className="error-message">{error}</p>
          <button onClick={resetGame} className="retry-button">
            Try Again
          </button>
        </div>

        <style jsx>{`
          .error-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }

          .error-container {
            text-align: center;
          }

          .error-title {
            font-size: 2rem;
            font-weight: 700;
            color: #ef4444;
            margin-bottom: 1rem;
          }

          .error-message {
            font-size: 1rem;
            color: #64748b;
            margin-bottom: 2rem;
          }

          .retry-button {
            padding: 0.75rem 1.5rem;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .retry-button:hover {
            background: #2563eb;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="game-play-page">
      <div className="container">
        {/* Header with back button */}
        <header className="page-header">
          <button
            onClick={() => router.push('/play')}
            className="back-button"
          >
            ← Back to Games
          </button>
          <div className="mode-badge">{mode}</div>
        </header>

        {/* Game renderer */}
        {gameState && !isGameOver && (
          <GameRenderer
            game={game}
            gameState={gameState}
            onAction={submitAction}
          />
        )}

        {/* Summary when game is complete */}
        {isGameOver && summary && (
          <div className="summary-container">
            <SummaryCard
              score={summary.score}
              maxScore={100}
              duration={summary.durationMs}
              skillSignals={summary.skillSignals}
              metadata={summary.metadata}
            />

            <div className="action-buttons">
              <button onClick={resetGame} className="play-again-button">
                Play Again
              </button>
              <button
                onClick={() => router.push('/play')}
                className="change-game-button"
              >
                Choose Another Game
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .game-play-page {
          min-height: 100vh;
          background: linear-gradient(to bottom, #f8fafc, #e2e8f0);
          padding: 2rem 1rem;
        }

        .container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .back-button {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-button:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .mode-badge {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border-radius: 8px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .summary-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .play-again-button,
        .change-game-button {
          flex: 1;
          padding: 1rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .play-again-button {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
        }

        .play-again-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
        }

        .change-game-button {
          background: white;
          border: 2px solid #e2e8f0;
          color: #64748b;
        }

        .change-game-button:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }
      `}</style>
    </div>
  );
}
