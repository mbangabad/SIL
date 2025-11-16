/**
 * A/B Testing & Experiments System
 * Lightweight, integrated framework for running experiments
 */

export interface ExperimentVariant {
  id: string;
  name: string;
  weight: number; // 0-100 percentage
  config?: Record<string, any>;
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: ExperimentVariant[];
  startDate?: number;
  endDate?: number;
  targetMetric: 'score' | 'retention' | 'engagement' | 'completion';
}

/**
 * Experiment Configuration
 * Add new experiments here
 */
export const EXPERIMENTS: Record<string, Experiment> = {
  'game-ui-style': {
    id: 'game-ui-style',
    name: 'Game UI Style',
    description: 'Test different visual styles for game cards',
    status: 'running',
    variants: [
      { id: 'control', name: 'Current Design', weight: 50 },
      { id: 'rounded', name: 'Rounded Corners', weight: 50 },
    ],
    targetMetric: 'engagement',
  },

  'score-feedback': {
    id: 'score-feedback',
    name: 'Score Feedback',
    description: 'Test different score presentation styles',
    status: 'running',
    variants: [
      { id: 'control', name: 'Simple Score', weight: 50 },
      { id: 'percentile', name: 'Score + Percentile', weight: 50 },
    ],
    targetMetric: 'score',
  },

  'daily-goal': {
    id: 'daily-goal',
    name: 'Daily Goal Variation',
    description: 'Test different daily goal thresholds',
    status: 'draft',
    variants: [
      { id: 'control', name: '3 Games', weight: 33, config: { gamesRequired: 3 } },
      { id: 'easy', name: '1 Game', weight: 33, config: { gamesRequired: 1 } },
      { id: 'hard', name: '5 Games', weight: 34, config: { gamesRequired: 5 } },
    ],
    targetMetric: 'completion',
  },
};

/**
 * Feature Flags
 * Toggle features on/off without code changes
 */
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number; // 0-100
}

export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  'dark-mode': {
    id: 'dark-mode',
    name: 'Dark Mode',
    description: 'Enable dark mode theme switching',
    enabled: true,
    rolloutPercentage: 100,
  },

  'progression-system': {
    id: 'progression-system',
    name: 'Progression System',
    description: 'XP, levels, streaks, and daily goals',
    enabled: true,
    rolloutPercentage: 100,
  },

  'social-sharing': {
    id: 'social-sharing',
    name: 'Social Sharing',
    description: 'Share game results on social media',
    enabled: false,
    rolloutPercentage: 0,
  },

  'brainprint-evolution': {
    id: 'brainprint-evolution',
    name: 'Brainprint Evolution',
    description: 'Show brainprint changes over time',
    enabled: true,
    rolloutPercentage: 100,
  },

  'training-packs': {
    id: 'training-packs',
    name: 'Training Packs',
    description: 'Curated game collections (Focus, Creativity, etc.)',
    enabled: false,
    rolloutPercentage: 50,
  },
};

/**
 * Game Toggle Configuration
 * Enable/disable individual games
 */
export interface GameToggle {
  gameId: string;
  enabled: boolean;
  disabledReason?: string;
}

// All games enabled by default
export const GAME_TOGGLES: Record<string, GameToggle> = {};

/**
 * Experiment Assignment Service
 * Assigns users to experiment variants deterministically
 */
export class ExperimentService {
  /**
   * Assign user to experiment variant
   * Uses deterministic hash of userId + experimentId for consistency
   */
  assignVariant(userId: string, experimentId: string): string {
    const experiment = EXPERIMENTS[experimentId];
    if (!experiment || experiment.status !== 'running') {
      return 'control';
    }

    // Deterministic hash: simple string hash
    const hash = this.hashString(`${userId}-${experimentId}`);
    const percentage = hash % 100;

    // Find variant based on weight distribution
    let cumulative = 0;
    for (const variant of experiment.variants) {
      cumulative += variant.weight;
      if (percentage < cumulative) {
        return variant.id;
      }
    }

    return experiment.variants[0].id; // Fallback to first variant
  }

  /**
   * Check if feature flag is enabled for user
   */
  isFeatureEnabled(featureId: string, userId?: string): boolean {
    const flag = FEATURE_FLAGS[featureId];
    if (!flag) return false;
    if (!flag.enabled) return false;

    // If 100% rollout, enabled for everyone
    if (flag.rolloutPercentage >= 100) return true;

    // If no userId, use rollout percentage randomly
    if (!userId) {
      return Math.random() * 100 < flag.rolloutPercentage;
    }

    // Deterministic rollout based on userId
    const hash = this.hashString(`${userId}-${featureId}`);
    return (hash % 100) < flag.rolloutPercentage;
  }

  /**
   * Check if game is enabled
   */
  isGameEnabled(gameId: string): boolean {
    const toggle = GAME_TOGGLES[gameId];
    return toggle ? toggle.enabled : true; // Default enabled
  }

  /**
   * Get experiment variant config
   */
  getVariantConfig(experimentId: string, variantId: string): Record<string, any> {
    const experiment = EXPERIMENTS[experimentId];
    if (!experiment) return {};

    const variant = experiment.variants.find(v => v.id === variantId);
    return variant?.config || {};
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// Singleton instance
export const experimentService = new ExperimentService();

/**
 * Track experiment assignment in telemetry
 */
export function trackExperimentAssignment(
  userId: string,
  experimentId: string,
  variantId: string
): void {
  // This will be called from components that use experiments
  // Telemetry tracking happens automatically via existing system
  if (typeof window !== 'undefined') {
    import('@sil/core').then(({ telemetry }) => {
      telemetry.track({
        type: 'ab_assignment',
        userId,
        metadata: {
          experimentId,
          variantId,
          assignmentMethod: 'deterministic',
        },
      });
    });
  }
}
