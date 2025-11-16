/**
 * BrainprintChart Component
 *
 * Visualizes user's cognitive skill profile (brainprint)
 * Shows skill distribution across different dimensions
 */

import React from 'react';
import { tokens } from '../tokens';

export interface BrainprintData {
  [skill: string]: number;
}

export interface BrainprintChartProps {
  /** Brainprint data (skill name → value 0-100) */
  brainprint: BrainprintData;
  /** Display mode */
  mode?: 'radar' | 'bars' | 'compact';
  /** Title */
  title?: string;
  /** Show only top N skills */
  topSkills?: number;
  /** Custom CSS class */
  className?: string;
}

/**
 * Get color for skill value
 */
function getSkillColor(value: number): string {
  if (value >= 80) return tokens.colors.success;
  if (value >= 60) return tokens.colors.primary;
  if (value >= 40) return tokens.colors.warning;
  return tokens.colors.textSecondary;
}

/**
 * Format skill name for display
 */
function formatSkillName(skill: string): string {
  // Convert camelCase to Title Case
  return skill
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Bars visualization
 */
const BarsView: React.FC<{ skills: Array<{ name: string; value: number }> }> = ({
  skills,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
      {skills.map(({ name, value }) => (
        <div key={name}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: tokens.spacing.xs,
              fontSize: tokens.fontSizes.sm,
              color: tokens.colors.text,
            }}
          >
            <span>{formatSkillName(name)}</span>
            <span style={{ fontWeight: tokens.fontWeights.bold }}>{value}</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: tokens.colors.card,
              borderRadius: tokens.radius.full,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${value}%`,
                height: '100%',
                backgroundColor: getSkillColor(value),
                borderRadius: tokens.radius.full,
                transition: tokens.transitions.medium,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Compact view (top skills only)
 */
const CompactView: React.FC<{ skills: Array<{ name: string; value: number }> }> = ({
  skills,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: tokens.spacing.md,
      }}
    >
      {skills.map(({ name, value }) => (
        <div
          key={name}
          style={{
            backgroundColor: tokens.colors.card,
            padding: tokens.spacing.md,
            borderRadius: tokens.radius.md,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: tokens.fontSizes.xxl,
              fontWeight: tokens.fontWeights.bold,
              color: getSkillColor(value),
              marginBottom: tokens.spacing.xs,
            }}
          >
            {value}
          </div>
          <div
            style={{
              fontSize: tokens.fontSizes.xs,
              color: tokens.colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {formatSkillName(name)}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Simple radar chart visualization (SVG-based)
 */
const RadarView: React.FC<{ skills: Array<{ name: string; value: number }> }> = ({
  skills,
}) => {
  const size = 300;
  const center = size / 2;
  const radius = size / 2 - 40;
  const numSkills = skills.length;

  if (numSkills === 0) return null;

  // Calculate points for polygon
  const points = skills.map((skill, index) => {
    const angle = (Math.PI * 2 * index) / numSkills - Math.PI / 2;
    const distance = (skill.value / 100) * radius;
    const x = center + Math.cos(angle) * distance;
    const y = center + Math.sin(angle) * distance;
    return { x, y, skill };
  });

  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');

  // Background circles
  const circles = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg width={size} height={size} style={{ maxWidth: '100%', height: 'auto' }}>
      {/* Background circles */}
      {circles.map((ratio, i) => (
        <circle
          key={i}
          cx={center}
          cy={center}
          r={radius * ratio}
          fill="none"
          stroke={tokens.colors.card}
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {points.map((point, i) => {
        const angle = (Math.PI * 2 * i) / numSkills - Math.PI / 2;
        const endX = center + Math.cos(angle) * radius;
        const endY = center + Math.sin(angle) * radius;
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={endX}
            y2={endY}
            stroke={tokens.colors.card}
            strokeWidth="1"
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={pointsString}
        fill={tokens.colors.primary}
        fillOpacity="0.3"
        stroke={tokens.colors.primary}
        strokeWidth="2"
      />

      {/* Data points */}
      {points.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="4"
          fill={tokens.colors.primary}
        />
      ))}

      {/* Labels */}
      {points.map((point, i) => {
        const angle = (Math.PI * 2 * i) / numSkills - Math.PI / 2;
        const labelDistance = radius + 25;
        const labelX = center + Math.cos(angle) * labelDistance;
        const labelY = center + Math.sin(angle) * labelDistance;

        return (
          <text
            key={i}
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={tokens.colors.text}
            fontSize={tokens.fontSizes.xs}
            fontWeight={tokens.fontWeights.medium}
          >
            {formatSkillName(point.skill.name).split(' ')[0]}
          </text>
        );
      })}
    </svg>
  );
};

/**
 * BrainprintChart Component
 */
export const BrainprintChart: React.FC<BrainprintChartProps> = ({
  brainprint,
  mode = 'bars',
  title = 'Cognitive Profile',
  topSkills,
  className = '',
}) => {
  // Filter out meta fields
  const skills = Object.entries(brainprint)
    .filter(([key, value]) => {
      return (
        typeof value === 'number' &&
        key !== 'totalGames' &&
        key !== 'confidenceScore' &&
        !key.includes('Updated')
      );
    })
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value);

  // Limit to top skills if specified
  const displaySkills = topSkills ? skills.slice(0, topSkills) : skills;

  if (displaySkills.length === 0) {
    return (
      <div
        className={className}
        style={{
          textAlign: 'center',
          padding: tokens.spacing.xl,
          color: tokens.colors.textSecondary,
        }}
      >
        No brainprint data available. Play some games to build your profile!
      </div>
    );
  }

  const containerStyle: React.CSSProperties = {
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.xl,
    boxShadow: tokens.shadows.soft,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: tokens.fontSizes.xl,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.lg,
    fontFamily: tokens.fonts.title,
  };

  return (
    <div className={className} style={containerStyle}>
      <h3 style={titleStyle}>{title}</h3>

      {mode === 'radar' && <RadarView skills={displaySkills.slice(0, 8)} />}
      {mode === 'bars' && <BarsView skills={displaySkills} />}
      {mode === 'compact' && <CompactView skills={displaySkills} />}

      {brainprint.confidenceScore !== undefined && (
        <div
          style={{
            marginTop: tokens.spacing.lg,
            fontSize: tokens.fontSizes.xs,
            color: tokens.colors.textSecondary,
            textAlign: 'center',
          }}
        >
          Confidence: {Math.round(brainprint.confidenceScore)}% •{' '}
          {brainprint.totalGames || 0} games played
        </div>
      )}
    </div>
  );
};
