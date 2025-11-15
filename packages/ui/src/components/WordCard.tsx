/**
 * WordCard Component
 *
 * Displays a word in a card format with different states
 * Used across all word-based games
 */

import React from 'react';
import { tokens } from '../tokens';

export type WordCardState =
  | 'default'
  | 'selected'
  | 'disabled'
  | 'correct'
  | 'incorrect'
  | 'hover';

export interface WordCardProps {
  /** The word to display */
  text: string;
  /** Current state of the card */
  state?: WordCardState;
  /** Callback when card is tapped/clicked */
  onTap?: () => void;
  /** Optional emoji or icon to display */
  icon?: string;
  /** Optional heat value for hot/cold feedback (0-1) */
  heat?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom CSS class */
  className?: string;
}

const stateStyles: Record<WordCardState, React.CSSProperties> = {
  default: {
    backgroundColor: tokens.colors.card,
    color: tokens.colors.text,
    border: '2px solid transparent',
    cursor: 'pointer',
  },
  selected: {
    backgroundColor: tokens.colors.selected,
    color: tokens.colors.text,
    border: '2px solid ' + tokens.colors.primary,
    cursor: 'pointer',
    transform: 'scale(1.05)',
  },
  disabled: {
    backgroundColor: tokens.colors.disabled,
    color: tokens.colors.textSecondary,
    border: '2px solid transparent',
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  correct: {
    backgroundColor: tokens.colors.correct,
    color: tokens.colors.text,
    border: '2px solid transparent',
    cursor: 'default',
  },
  incorrect: {
    backgroundColor: tokens.colors.error,
    color: tokens.colors.text,
    border: '2px solid transparent',
    cursor: 'default',
  },
  hover: {
    backgroundColor: tokens.colors.cardHover,
    color: tokens.colors.text,
    border: '2px solid ' + tokens.colors.primary,
    cursor: 'pointer',
    transform: 'scale(1.02)',
  },
};

const sizeStyles = {
  sm: {
    padding: tokens.spacing.sm,
    fontSize: tokens.fontSizes.sm,
    borderRadius: tokens.radius.md,
    minWidth: '60px',
    minHeight: '60px',
  },
  md: {
    padding: tokens.spacing.md,
    fontSize: tokens.fontSizes.lg,
    borderRadius: tokens.radius.lg,
    minWidth: '100px',
    minHeight: '100px',
  },
  lg: {
    padding: tokens.spacing.lg,
    fontSize: tokens.fontSizes.xl,
    borderRadius: tokens.radius.lg,
    minWidth: '140px',
    minHeight: '140px',
  },
};

/**
 * Convert heat value (0-1) to background color
 */
function heatToColor(heat: number): string {
  // Interpolate between cold (blue) and hot (red)
  const r = Math.round(heat * 255);
  const b = Math.round((1 - heat) * 255);
  return `rgb(${r}, 0, ${b})`;
}

export const WordCard: React.FC<WordCardProps> = ({
  text,
  state = 'default',
  onTap,
  icon,
  heat,
  size = 'md',
  className = '',
}) => {
  const [isHovering, setIsHovering] = React.useState(false);

  const handleClick = () => {
    if (state !== 'disabled' && onTap) {
      onTap();
    }
  };

  const currentState = isHovering && state === 'default' ? 'hover' : state;

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: tokens.fonts.body,
    fontWeight: tokens.fontWeights.semibold,
    transition: tokens.transitions.fast,
    boxShadow: tokens.shadows.soft,
    userSelect: 'none',
    ...sizeStyles[size],
    ...stateStyles[currentState],
  };

  // Override background if heat is provided
  if (heat !== undefined) {
    baseStyle.backgroundColor = heatToColor(heat);
  }

  return (
    <div
      style={baseStyle}
      className={className}
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      role="button"
      tabIndex={state !== 'disabled' ? 0 : -1}
      aria-disabled={state === 'disabled'}
      aria-pressed={state === 'selected'}
    >
      {icon && (
        <div style={{ fontSize: tokens.fontSizes.xxl, marginBottom: tokens.spacing.sm }}>
          {icon}
        </div>
      )}
      <div>{text}</div>
    </div>
  );
};
