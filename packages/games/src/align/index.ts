/**
 * ALIGN Game
 *
 * Tap the point closest to the hidden spatial center of a scattered dot cluster.
 * Tests spatial centroid intuition and geometric estimation.
 */

import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface Point {
  x: number;
  y: number;
  id: string;
}

interface AlignState {
  points: Point[];
  hiddenCenter: { x: number; y: number };
  selectedPointId: string | null;
  score: number;
  startTime: number;
}

/**
 * Generate scattered points around a hidden center
 */
function generatePoints(hiddenX: number, hiddenY: number, count: number, seed: number): Point[] {
  const points: Point[] = [];
  const random = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < count; i++) {
    const angle = random(seed + i * 2) * Math.PI * 2;
    const distance = random(seed + i * 2 + 1) * 0.4; // Max distance from center

    points.push({
      x: hiddenX + Math.cos(angle) * distance,
      y: hiddenY + Math.sin(angle) * distance,
      id: `point-${i}`,
    });
  }

  return points;
}

/**
 * Calculate Euclidean distance between two points
 */
function euclideanDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export const alignGame: GameDefinition = {
  id: 'align',
  name: 'ALIGN',
  shortDescription: 'Tap the point closest to the hidden center',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const baseSeed = parseInt(ctx.seed, 10) || 0;
    // Generate hidden center
    const random = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    const hiddenX = 0.3 + random(baseSeed) * 0.4; // Keep center away from edges
    const hiddenY = 0.3 + random(baseSeed + 1) * 0.4;

    // Generate points
    const points = generatePoints(hiddenX, hiddenY, 9, baseSeed + 2);

    const state: AlignState = {
      points,
      hiddenCenter: { x: hiddenX, y: hiddenY },
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
    const alignState = state.data as AlignState;

    if (action.type === 'tap') {
      const pointId = action.payload.wordId;
      const selectedPoint = alignState.points.find(p => p.id === pointId);

      if (!selectedPoint) {
        return state;
      }

      // Calculate distance to hidden center
      const distance = euclideanDistance(selectedPoint, alignState.hiddenCenter);

      // Calculate max possible distance for normalization
      const maxDistance = Math.sqrt(2); // Diagonal of unit square

      // Score: inverse distance (closer = higher score)
      const score = Math.round(Math.max(0, 100 - (distance / maxDistance) * 100));

      return {
        ...state,
        done: true,
        data: {
          ...alignState,
          selectedPointId: pointId,
          score,
        },
      };
    }

    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const alignState = state.data as AlignState;

    return {
      score: alignState.score,
      durationMs: Date.now() - alignState.startTime,
      skillSignals: {
        spatial_precision: alignState.score,
        pattern_density_estimation: alignState.score * 0.9,
        executive_inhibition: alignState.score * 0.8,
      },
      metadata: {
        selectedPointId: alignState.selectedPointId,
        hiddenCenter: alignState.hiddenCenter,
        pointCount: alignState.points.length,
      },
    };
  },

  uiSchema: {
    input: 'tap-one',
    layout: 'grid',
    feedback: 'hot-cold',
    
  },
};
