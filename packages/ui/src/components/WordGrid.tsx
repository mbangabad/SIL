/**
 * WordGrid Component
 *
 * Displays a grid of WordCard components
 * Supports different grid sizes (3x3, 3x4, 4x4, etc.)
 */

import React from 'react';
import { WordCard, type WordCardState } from './WordCard';
import { tokens } from '../tokens';

export interface GridWord {
  id: string;
  text: string;
  state?: WordCardState;
  icon?: string;
  heat?: number;
}

export interface WordGridProps {
  /** Words to display in grid */
  words: GridWord[];
  /** Number of columns */
  columns?: number;
  /** Callback when a word is tapped */
  onWordTap?: (wordId: string) => void;
  /** Size of cards */
  cardSize?: 'sm' | 'md' | 'lg';
  /** Gap between cards */
  gap?: 'sm' | 'md' | 'lg';
  /** Custom CSS class */
  className?: string;
}

const gapSizes = {
  sm: tokens.spacing.sm,
  md: tokens.spacing.md,
  lg: tokens.spacing.lg,
};

export const WordGrid: React.FC<WordGridProps> = ({
  words,
  columns = 3,
  onWordTap,
  cardSize = 'md',
  gap = 'md',
  className = '',
}) => {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: gapSizes[gap],
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
  };

  return (
    <div style={gridStyle} className={className} role="grid">
      {words.map((word) => (
        <WordCard
          key={word.id}
          text={word.text}
          state={word.state}
          icon={word.icon}
          heat={word.heat}
          size={cardSize}
          onTap={() => onWordTap?.(word.id)}
        />
      ))}
    </div>
  );
};
