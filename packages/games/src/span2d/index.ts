/**
 * SPAN2D Game
 *
 * Pick the 2D point closest to a hidden target on a scatter plot.
 * Tests 2D spatial reasoning and geometric intuition.
 */

import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface Point2D {
  x: number;
  y: number;
  id: string;
}

interface Span2DState {
  target: Point2D;
  points: Point2D[];
  selectedPointId: string | null;
  score: number;
  startTime: number;
}

function generateScatteredPoints(target: Point2D, count: number, seed: number): Point2D[] {
  const points: Point2D[] = [];
  const random = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < count; i++) {
    const angle = random(seed + i * 2) * Math.PI * 2;
    const distance = random(seed + i * 2 + 1) * 0.5;

    points.push({
      x: Math.max(0, Math.min(1, target.x + Math.cos(angle) * distance)),
      y: Math.max(0, Math.min(1, target.y + Math.sin(angle) * distance)),
      id: `point-${i}`,
    });
  }

  return points;
}

function distance2D(p1: Point2D, p2: Point2D): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export const span2dGame: GameDefinition = {
  id: 'span2d',
  name: 'SPAN2D',
  shortDescription: 'Pick the point closest to the 2D target',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const baseSeed = parseInt(ctx.seed, 10) || 0;
    const random = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    const target: Point2D = {
      x: 0.2 + random(baseSeed) * 0.6,
      y: 0.2 + random(baseSeed + 1) * 0.6,
      id: 'target',
    };

    const points = generateScatteredPoints(target, 9, baseSeed + 2);

    const state: Span2DState = {
      target,
      points,
      selectedPointId: null,
      score: 0,
      startTime: Date.now(),
    };

    return {
      step: 0,
      done: false,
      data: state,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const span2dState = state.data as Span2DState;

    if (action.type === 'tap') {
      const pointId = action.payload.wordId;
      const selectedPoint = span2dState.points.find(p => p.id === pointId);

      if (!selectedPoint) {
        return state;
      }

      const distance = distance2D(selectedPoint, span2dState.target);
      const maxDistance = Math.sqrt(2);
      const score = Math.round(Math.max(0, 100 - (distance / maxDistance) * 100));

      return {
        ...state,
        done: true,
        data: {
          ...span2dState,
          selectedPointId: pointId,
          score,
        },
      };
    }

    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const span2dState = state.data as Span2DState;

    return {
      score: span2dState.score,
      durationMs: Date.now() - span2dState.startTime,
      skillSignals: {
        spatial_precision: span2dState.score,
        geometric_intuition: span2dState.score * 0.9,
        analogical_mapping: span2dState.score * 0.85,
      },
      metadata: {
        target: span2dState.target,
        selectedPointId: span2dState.selectedPointId,
      },
    };
  },

  uiSchema: {
    input: 'tap-one',
    layout: 'grid',
    feedback: 'hot-cold',
    
  },
};
