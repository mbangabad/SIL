/**
 * GameRenderer Component
 *
 * Dynamically renders the appropriate UI for any SIL game
 * Maps game state to UI components based on game type and uiSchema
 */

'use client';

import React, { useMemo } from 'react';
import type { GameDefinition, GameState, PlayerAction } from '@sil/core';
import {
  WordCard,
  WordGrid,
  InputBox,
  HotColdMeter,
  ScoreBar,
  Slider,
} from '@sil/ui';

export interface GameRendererProps {
  game: GameDefinition;
  gameState: GameState;
  onAction: (action: PlayerAction) => void;
  disabled?: boolean;
}

/**
 * Renders a game based on its UI schema
 *
 * @example
 * ```tsx
 * <GameRenderer
 *   game={gripGame}
 *   gameState={state}
 *   onAction={handleAction}
 * />
 * ```
 */
export const GameRenderer: React.FC<GameRendererProps> = ({
  game,
  gameState,
  onAction,
  disabled = false,
}) => {
  const { uiSchema } = game;
  const gameData = gameState.data as any;

  // Handle word selection
  const handleWordClick = (word: string, index: number) => {
    if (disabled || gameState.done) return;

    onAction({
      type: 'select',
      payload: { word, index },
      timestamp: Date.now(),
    });
  };

  // Handle text input
  const handleTextSubmit = (text: string) => {
    if (disabled || gameState.done) return;

    onAction({
      type: 'submit',
      payload: { word: text },
      timestamp: Date.now(),
    });
  };

  // Handle slider change for VECTOR game
  const handleSliderChange = (value: number) => {
    if (disabled || gameState.done) return;

    onAction({
      type: 'custom',
      payload: { type: 'slider', value },
      timestamp: Date.now(),
    });
  };

  // Handle slider submit for VECTOR game
  const handleSliderSubmit = () => {
    if (disabled || gameState.done) return;

    onAction({
      type: 'custom',
      payload: { type: 'submit' },
      timestamp: Date.now(),
    });
  };

  // Render word grid (for games like GRIP, ZERO, PING, etc.)
  const renderWordGrid = () => {
    const words = gameData.words || gameData.options || [];
    const selectedIndex = gameData.selectedIndex ?? gameData.selectedWordIndex ?? null;

    if (!words.length) return null;

    return (
      <WordGrid layout={uiSchema.layout || '3x3'}>
        {words.map((word: string, index: number) => (
          <WordCard
            key={index}
            word={word}
            state={
              selectedIndex === index
                ? 'selected'
                : gameState.done
                ? 'default'
                : 'default'
            }
            onClick={() => handleWordClick(word, index)}
            disabled={disabled || gameState.done}
          />
        ))}
      </WordGrid>
    );
  };

  // Render text input (for games like FLOW, SPLICE)
  const renderTextInput = () => {
    return (
      <InputBox
        placeholder={uiSchema.inputPlaceholder || 'Enter your word...'}
        onSubmit={handleTextSubmit}
        disabled={disabled || gameState.done}
        maxLength={50}
      />
    );
  };

  // Render slider (for VECTOR game)
  const renderSlider = () => {
    const position = gameData.userPosition ?? 0.5;
    const anchorA = gameData.anchorA || '';
    const anchorB = gameData.anchorB || '';

    return (
      <div className="vector-game-ui">
        <Slider
          value={position}
          onChange={handleSliderChange}
          leftLabel={anchorA}
          rightLabel={anchorB}
          showPercentage
          disabled={disabled || gameState.done}
        />
        {!gameState.done && (
          <button
            onClick={handleSliderSubmit}
            disabled={disabled}
            className="submit-button"
          >
            Submit Position
          </button>
        )}

        <style jsx>{`
          .vector-game-ui {
            max-width: 600px;
            margin: 2rem auto;
          }

          .submit-button {
            width: 100%;
            margin-top: 2rem;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .submit-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
          }

          .submit-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    );
  };

  // Render hot/cold meter (for CLUSTER game)
  const renderHotColdMeter = () => {
    const heat = gameData.lastHeat ?? 0;

    return (
      <div className="hot-cold-container">
        <HotColdMeter value={heat} />
        <style jsx>{`
          .hot-cold-container {
            margin: 2rem 0;
          }
        `}</style>
      </div>
    );
  };

  // Render score bar
  const renderScoreBar = () => {
    const score = gameData.score ?? 0;
    const maxScore = 100;

    return (
      <div className="score-container">
        <ScoreBar value={score} max={maxScore} label="Score" />
        <style jsx>{`
          .score-container {
            margin: 1rem 0;
          }
        `}</style>
      </div>
    );
  };

  // Render game info
  const renderGameInfo = () => {
    return (
      <div className="game-info">
        <h2 className="game-title">{game.name}</h2>
        <p className="game-description">{game.shortDescription}</p>
        <div className="game-meta">
          <span className="step-counter">
            Step {gameState.step + 1}
          </span>
          {gameState.done && (
            <span className="game-complete">Complete!</span>
          )}
        </div>

        <style jsx>{`
          .game-info {
            text-align: center;
            margin-bottom: 2rem;
          }

          .game-title {
            font-size: 2rem;
            font-weight: 700;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
          }

          .game-description {
            font-size: 1rem;
            color: #64748b;
            margin-bottom: 1rem;
          }

          .game-meta {
            display: flex;
            justify-content: center;
            gap: 1rem;
            font-size: 0.875rem;
          }

          .step-counter {
            color: #94a3b8;
          }

          .game-complete {
            color: #10b981;
            font-weight: 600;
          }
        `}</style>
      </div>
    );
  };

  // Determine which UI elements to render based on uiSchema
  const shouldShowWordGrid = uiSchema.primaryInput === 'grid' ||
    game.id === 'grip' || game.id === 'zero' || game.id === 'ping' ||
    game.id === 'span' || game.id === 'cluster' || game.id === 'colorglyph' ||
    game.id === 'trace' || game.id === 'tensor' || game.id === 'one' ||
    game.id === 'tribes' || game.id === 'ghost' || game.id === 'motif' ||
    game.id === 'pivotword' || game.id === 'radial' || game.id === 'shard' ||
    game.id === 'spoke';

  const shouldShowTextInput = uiSchema.primaryInput === 'text' ||
    game.id === 'flow' || game.id === 'splice' || game.id === 'loop' ||
    game.id === 'echochain' || game.id === 'merge' || game.id === 'traceword' ||
    game.id === 'warpword';

  const shouldShowSlider = game.id === 'vector';

  const shouldShowHotColdMeter = game.id === 'cluster';

  const shouldShowScore = gameData.score !== undefined;

  return (
    <div className="game-renderer">
      {renderGameInfo()}

      {shouldShowScore && renderScoreBar()}

      {shouldShowHotColdMeter && renderHotColdMeter()}

      {shouldShowWordGrid && renderWordGrid()}

      {shouldShowTextInput && renderTextInput()}

      {shouldShowSlider && renderSlider()}

      <style jsx>{`
        .game-renderer {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
};
