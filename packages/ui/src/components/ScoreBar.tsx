/**
 * ScoreBar Component
 *
 * Animated progress/score bar
 * Shows score as a percentage or absolute value
 */

import React from 'react';
import { tokens } from '../tokens';

export interface ScoreBarProps {
  /** Current score value */
  score: number;
  /** Maximum score (for percentage calculation) */
  maxScore?: number;
  /** Label to display */
  label?: string;
  /** Show numeric value */
  showValue?: boolean;
  /** Color scheme */
  color?: 'primary' | 'success' | 'warning' | 'error';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Animate the fill */
  animated?: boolean;
  /** Custom CSS class */
  className?: string;
}

const colorSchemes = {
  primary: tokens.colors.primary,
  success: tokens.colors.success,
  warning: tokens.colors.warning,
  error: tokens.colors.error,
};

const sizeStyles = {
  sm: {
    height: '8px',
    fontSize: tokens.fontSizes.xs,
  },
  md: {
    height: '16px',
    fontSize: tokens.fontSizes.sm,
  },
  lg: {
    height: '24px',
    fontSize: tokens.fontSizes.md,
  },
};

export const ScoreBar: React.FC<ScoreBarProps> = ({
  score,
  maxScore = 100,
  label,
  showValue = true,
  color = 'primary',
  size = 'md',
  animated = true,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));

  const containerStyle: React.CSSProperties = {
    width: '100%',
    marginBottom: tokens.spacing.md,
  };

  const barContainerStyle: React.CSSProperties = {
    width: '100%',
    height: sizeStyles[size].height,
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radius.full,
    overflow: 'hidden',
    position: 'relative',
  };

  const fillStyle: React.CSSProperties = {
    height: '100%',
    width: `${percentage}%`,
    backgroundColor: colorSchemes[color],
    borderRadius: tokens.radius.full,
    transition: animated ? tokens.transitions.medium : 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: tokens.spacing.sm,
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
    fontSize: sizeStyles[size].fontSize,
    color: tokens.colors.text,
    fontWeight: tokens.fontWeights.semibold,
  };

  return (
    <div style={containerStyle} className={className}>
      {(label || showValue) && (
        <div style={labelStyle}>
          {label && <span>{label}</span>}
          {showValue && (
            <span>
              {Math.round(score)}/{maxScore}
            </span>
          )}
        </div>
      )}
      <div style={barContainerStyle}>
        <div style={fillStyle} role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={maxScore} />
      </div>
    </div>
  );
};
