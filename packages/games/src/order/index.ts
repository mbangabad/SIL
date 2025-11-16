/** ORDER Game - Sequential ordering task */
import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface OrderState {
  numbers: number[];
  correctOrder: number[];
  tappedSequence: number[];
  score: number;
  startTime: number;
}

export const orderGame: GameDefinition = {
  id: 'order',
  name: 'ORDER',
  shortDescription: 'Tap the numbers in ascending order',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);

    // Generate 9 random numbers
    const numbers = [];
    for (let i = 0; i < 9; i++) {
      numbers.push(10 + Math.floor(random(ctx.seed + i) * 80));
    }

    const correctOrder = [...numbers].sort((a, b) => a - b);

    return {
      step: 0,
      done: false,
      data: {
        numbers,
        correctOrder,
        tappedSequence: [],
        score: 0,
        startTime: Date.now(),
      } as OrderState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const orderState = state.data as OrderState;

    if (action.type === 'select') {
      const tapped = orderState.numbers[action.payload.index];
      const newSequence = [...orderState.tappedSequence, tapped];

      // Check if sequence is complete
      if (newSequence.length === orderState.numbers.length) {
        // Calculate score based on how many are in correct order
        let correctCount = 0;
        for (let i = 0; i < newSequence.length; i++) {
          if (newSequence[i] === orderState.correctOrder[i]) {
            correctCount++;
          }
        }
        const score = Math.round((correctCount / orderState.numbers.length) * 100);
        return { ...state, done: true, data: { ...orderState, tappedSequence: newSequence, score } };
      }

      return { ...state, data: { ...orderState, tappedSequence: newSequence } };
    }

    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const orderState = state.data as OrderState;
    return {
      score: orderState.score,
      durationMs: Date.now() - orderState.startTime,
      skillSignals: { sequential_ordering: orderState.score, number_comparison: orderState.score * 0.9 },
      metadata: { sequenceLength: orderState.numbers.length },
    };
  },

  uiSchema: { primaryInput: 'tap-sequence', layout: '3x3', feedback: 'progressive', showScore: true },
};
