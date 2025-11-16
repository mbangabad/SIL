/**
 * GameRenderer Component
 *
 * Dynamically renders the appropriate UI for any SIL game
 * Maps game state to UI components based on uiSchema (schema-driven, no hardcoded game IDs)
 */

'use client';

import React from 'react';
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
 * SCHEMA-DRIVEN: Uses uiSchema.input and uiSchema.layout, NOT game.id
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

  // Handle word/option selection (tap-one input type)
  // Uses official PlayerAction type: { type: 'tap', payload: { wordId: string } }
  const handleWordClick = (word: string, index: number) => {
    if (disabled || gameState.done) return;

    onAction({
      type: 'tap',
      payload: { wordId: String(index) },
    });
  };

  // Handle text input submission
  // Uses official PlayerAction type: { type: 'submitWord', payload: { text: string } }
  const handleTextSubmit = (text: string) => {
    if (disabled || gameState.done) return;

    // Input validation
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 50) {
      console.warn('Invalid input: empty or too long');
      return;
    }

    onAction({
      type: 'submitWord',
      payload: { text: trimmed },
    });
  };

  // Handle slider interaction (custom type for special games like VECTOR)
  const handleSliderChange = (value: number) => {
    if (disabled || gameState.done) return;

    onAction({
      type: 'custom',
      payload: { type: 'slider', value },
    });
  };

  // Handle slider submit
  const handleSliderSubmit = () => {
    if (disabled || gameState.done) return;

    onAction({
      type: 'custom',
      payload: { type: 'submit' },
    });
  };

  // Render word grid (for tap-one/tap-many input types)
  const renderWordGrid = () => {
    const words = gameData.words || gameData.options || [];
    const selectedIndex = gameData.selectedIndex ?? gameData.selectedWordIndex ?? null;

    if (!words.length) return null;

    return (
      <WordGrid layout={uiSchema.layout || 'grid'}>
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
            aria-label={`Select option ${index + 1}: ${word}`}
          />
        ))}
      </WordGrid>
    );
  };

  // Render text input (for type-one-word input type)
  const renderTextInput = () => {
    return (
      <InputBox
        placeholder={uiSchema.inputPlaceholder || 'Enter your word...'}
        onSubmit={handleTextSubmit}
        disabled={disabled || gameState.done}
        maxLength={50}
        aria-label="Text input for word submission"
      />
    );
  };

  // Render slider (for dual-anchor layout)
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
          aria-label={`Slider between ${anchorA} and ${anchorB}`}
        />
        {!gameState.done && (
          <button
            onClick={handleSliderSubmit}
            disabled={disabled}
            className="submit-button"
            aria-label="Submit slider position"
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

  // Render hot/cold meter (for hot-cold feedback type)
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

  // Render score bar (for score-bar feedback type)
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

  // SCHEMA-DRIVEN LOGIC: Determine UI elements based on uiSchema, NOT game.id
  const shouldShowWordGrid =
    uiSchema.input === 'tap-one' || uiSchema.input === 'tap-many';

  const shouldShowTextInput = uiSchema.input === 'type-one-word';

  const shouldShowSlider = uiSchema.layout === 'dual-anchor';

  const shouldShowHotColdMeter = uiSchema.feedback === 'hot-cold';

  const shouldShowScoreBar =
    uiSchema.feedback === 'score-bar' && gameData.score !== undefined;

  return (
    <div className="game-renderer" role="main" aria-label={`${game.name} game interface`}>
      {renderGameInfo()}

      {shouldShowScoreBar && renderScoreBar()}

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
