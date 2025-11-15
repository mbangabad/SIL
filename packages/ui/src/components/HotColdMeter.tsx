/**
 * HotColdMeter Component
 *
 * Visual feedback for proximity to target
 * Displays gradient from cold (blue) to hot (red)
 */

import React from 'react';
import { tokens } from '../tokens';

export interface HotColdMeterProps {
  /** Heat value (0 = freezing, 1 = burning) */
  heat: number;
  /** Show numeric label */
  showLabel?: boolean;
  /** Show text label (freezing/cold/warm/hot/burning) */
  showTextLabel?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Custom CSS class */
  className?: string;
}

/**
 * Convert heat to label
 */
function heatToLabel(heat: number): string {
  if (heat < 0.2) return 'Freezing';
  if (heat < 0.4) return 'Cold';
  if (heat < 0.6) return 'Warm';
  if (heat < 0.8) return 'Hot';
  return 'Burning';
}

/**
 * Get gradient color for a heat value
 */
function getGradientColor(heat: number): string {
  // Interpolate through blue → purple → red
  if (heat < 0.5) {
    // Blue to purple
    const t = heat * 2;
    const r = Math.round(t * 138); // 0 to 138
    const g = 0;
    const b = Math.round(255 - t * 73); // 255 to 182
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Purple to red
    const t = (heat - 0.5) * 2;
    const r = Math.round(138 + t * 117); // 138 to 255
    const g = 0;
    const b = Math.round(182 - t * 182); // 182 to 0
    return `rgb(${r}, ${g}, ${b})`;
  }
}

const sizeStyles = {
  sm: {
    height: '12px',
    width: '100%',
    fontSize: tokens.fontSizes.xs,
  },
  md: {
    height: '20px',
    width: '100%',
    fontSize: tokens.fontSizes.sm,
  },
  lg: {
    height: '32px',
    width: '100%',
    fontSize: tokens.fontSizes.md,
  },
};

export const HotColdMeter: React.FC<HotColdMeterProps> = ({
  heat,
  showLabel = false,
  showTextLabel = true,
  size = 'md',
  orientation = 'horizontal',
  className = '',
}) => {
  const clampedHeat = Math.min(1, Math.max(0, heat));
  const label = heatToLabel(clampedHeat);
  const color = getGradientColor(clampedHeat);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    marginBottom: tokens.spacing.md,
  };

  const meterContainerStyle: React.CSSProperties = {
    width: '100%',
    height: sizeStyles[size].height,
    background: `linear-gradient(to right,
      ${tokens.colors.heatCold} 0%,
      #8b5cf6 50%,
      ${tokens.colors.heatHot} 100%)`,
    borderRadius: tokens.radius.full,
    position: 'relative',
    overflow: 'hidden',
  };

  const indicatorStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${clampedHeat * 100}%`,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '4px',
    height: '150%',
    backgroundColor: tokens.colors.text,
    boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
    transition: tokens.transitions.medium,
  };

  const labelsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tokens.spacing.xs,
    fontSize: sizeStyles[size].fontSize,
    color: tokens.colors.textSecondary,
  };

  const currentLabelStyle: React.CSSProperties = {
    fontSize: sizeStyles[size].fontSize,
    fontWeight: tokens.fontWeights.bold,
    color,
    textAlign: 'center',
    marginBottom: tokens.spacing.xs,
  };

  return (
    <div style={containerStyle} className={className}>
      {showTextLabel && (
        <div style={currentLabelStyle}>{label}</div>
      )}
      <div style={meterContainerStyle}>
        <div style={indicatorStyle} />
      </div>
      {showLabel && (
        <div style={labelsStyle}>
          <span>Freezing</span>
          <span>Burning</span>
        </div>
      )}
    </div>
  );
};
