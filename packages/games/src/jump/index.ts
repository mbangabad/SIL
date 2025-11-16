/** JUMP Game - Pattern continuation with arithmetic jumps */
import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface JumpState {
  sequence: number[];
  pattern: { type: 'constant' | 'alternating'; delta1: number; delta2?: number };
  correctNext: number;
  options: number[];
  selectedIndex: number | null;
  score: number;
  startTime: number;
}

export const jumpGame: GameDefinition = {
  id: 'jump',
  name: 'JUMP',
  shortDescription: 'Pick the next number in the sequence',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);

    // Generate pattern type
    const isAlternating = random(ctx.seed) > 0.5;
    const delta1 = Math.floor((random(ctx.seed + 1) - 0.5) * 10) + 1;
    const delta2 = isAlternating ? Math.floor((random(ctx.seed + 2) - 0.5) * 10) + 1 : undefined;

    // Generate sequence
    const start = Math.floor(random(ctx.seed + 3) * 20) + 10;
    const sequence: number[] = [start];

    if (isAlternating && delta2 !== undefined) {
      sequence.push(start + delta1);
      sequence.push(start + delta1 + delta2);
    } else {
      sequence.push(start + delta1);
      sequence.push(start + delta1 * 2);
    }

    // Calculate correct next
    const correctNext = isAlternating && delta2 !== undefined
      ? sequence[2] + delta1
      : sequence[2] + delta1;

    // Generate options (correct + 3 distractors)
    const options = [correctNext];
    for (let i = 0; i < 3; i++) {
      const offset = Math.floor((random(ctx.seed + 10 + i) - 0.5) * 20);
      options.push(correctNext + offset);
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(random(ctx.seed + 20 + i) * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return {
      step: 0,
      done: false,
      data: {
        sequence,
        pattern: { type: isAlternating ? 'alternating' : 'constant', delta1, delta2 },
        correctNext,
        options,
        selectedIndex: null,
        score: 0,
        startTime: Date.now(),
      } as JumpState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const jumpState = state.data as JumpState;
    if (action.type === 'select') {
      const selected = jumpState.options[action.payload.index];
      const score = selected === jumpState.correctNext ? 100 : 0;
      return { ...state, done: true, data: { ...jumpState, selectedIndex: action.payload.index, score } };
    }
    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const jumpState = state.data as JumpState;
    return {
      score: jumpState.score,
      durationMs: Date.now() - jumpState.startTime,
      skillSignals: { pattern_induction: jumpState.score, sequence_reasoning: jumpState.score * 0.9 },
      metadata: { pattern: jumpState.pattern },
    };
  },

  uiSchema: { primaryInput: 'grid', layout: '2x2', feedback: 'hot-cold', showScore: true },
};
