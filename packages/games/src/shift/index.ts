/**
 * SHIFT Game
 *
 * Pick the shape that matches the transformation pattern.
 * Tests spatial analogy and transformation reasoning.
 */

import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

type ShapeType = 'circle' | 'square' | 'triangle' | 'diamond';
type Transformation = 'rotate90' | 'rotate180' | 'flip-h' | 'flip-v' | 'scale-up' | 'scale-down';

interface ShapeConfig {
  type: ShapeType;
  rotation: number;
  scale: number;
  flipped: boolean;
}

interface ShiftState {
  shapeA: ShapeConfig;
  shapeB: ShapeConfig;
  transformation: Transformation;
  shapeC: ShapeConfig;
  options: ShapeConfig[];
  selectedIndex: number | null;
  score: number;
  startTime: number;
}

function applyTransformation(shape: ShapeConfig, transform: Transformation): ShapeConfig {
  const result = { ...shape };

  switch (transform) {
    case 'rotate90':
      result.rotation = (shape.rotation + 90) % 360;
      break;
    case 'rotate180':
      result.rotation = (shape.rotation + 180) % 360;
      break;
    case 'flip-h':
      result.flipped = !shape.flipped;
      break;
    case 'flip-v':
      result.rotation = (shape.rotation + 180) % 360;
      result.flipped = !shape.flipped;
      break;
    case 'scale-up':
      result.scale = shape.scale * 1.3;
      break;
    case 'scale-down':
      result.scale = shape.scale * 0.7;
      break;
  }

  return result;
}

export const shiftGame: GameDefinition = {
  id: 'shift',
  name: 'SHIFT',
  shortDescription: 'Pick the shape applying same transformation',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const random = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    const shapes: ShapeType[] = ['circle', 'square', 'triangle', 'diamond'];
    const transforms: Transformation[] = ['rotate90', 'rotate180', 'flip-h', 'scale-up'];

    // Create shape A
    const shapeA: ShapeConfig = {
      type: shapes[Math.floor(random(ctx.seed) * shapes.length)],
      rotation: 0,
      scale: 1,
      flipped: false,
    };

    // Select transformation
    const transformation = transforms[Math.floor(random(ctx.seed + 1) * transforms.length)];

    // Apply transformation to get shape B
    const shapeB = applyTransformation(shapeA, transformation);

    // Create shape C (different base shape)
    const shapeC: ShapeConfig = {
      type: shapes[Math.floor(random(ctx.seed + 2) * shapes.length)],
      rotation: Math.floor(random(ctx.seed + 3) * 4) * 90,
      scale: 1,
      flipped: false,
    };

    // Correct answer: apply same transformation to C
    const correctD = applyTransformation(shapeC, transformation);

    // Generate distractors
    const wrongTransforms: Transformation[] = transforms.filter(t => t !== transformation);
    const options = [
      correctD,
      applyTransformation(shapeC, wrongTransforms[0]),
      applyTransformation(shapeC, wrongTransforms[1]),
      shapeC, // No transformation
    ];

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(random(ctx.seed + 10 + i) * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    const correctIndex = options.indexOf(correctD);

    const state: ShiftState = {
      shapeA,
      shapeB,
      transformation,
      shapeC,
      options,
      selectedIndex: null,
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
    const shiftState = state.data as ShiftState;

    if (action.type === 'select') {
      const selectedIndex = action.payload.index;

      // Find correct index
      const correctD = applyTransformation(shiftState.shapeC, shiftState.transformation);
      const correctIndex = shiftState.options.findIndex(
        opt => opt.rotation === correctD.rotation &&
               opt.scale === correctD.scale &&
               opt.flipped === correctD.flipped
      );

      const isCorrect = selectedIndex === correctIndex;
      const score = isCorrect ? 100 : 0;

      return {
        ...state,
        done: true,
        data: {
          ...shiftState,
          selectedIndex,
          score,
        },
      };
    }

    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const shiftState = state.data as ShiftState;

    return {
      score: shiftState.score,
      durationMs: Date.now() - shiftState.startTime,
      skillSignals: {
        spatial_analogy: shiftState.score,
        transformation_reasoning: shiftState.score * 0.95,
        pattern_matching: shiftState.score * 0.85,
      },
      metadata: {
        transformation: shiftState.transformation,
        selectedIndex: shiftState.selectedIndex,
      },
    };
  },

  uiSchema: {
    primaryInput: 'grid',
    layout: '2x2',
    feedback: 'hot-cold',
    showScore: true,
  },
};
