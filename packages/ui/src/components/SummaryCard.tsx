/**
 * SummaryCard Component
 *
 * Displays game summary with score, percentile, and other metrics
 * Used at the end of every game session
 */

import React from 'react';
import { tokens } from '../tokens';

export interface SummaryMetric {
  label: string;
  value: string | number;
  icon?: string;
}

export interface SummaryCardProps {
  /** Game title */
  title: string;
  /** Primary score */
  score: number;
  /** Maximum possible score */
  maxScore?: number;
  /** Percentile rank (0-100) */
  percentile?: number;
  /** Additional metrics to display */
  metrics?: SummaryMetric[];
  /** Action buttons */
  actions?: React.ReactNode;
  /** Custom CSS class */
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  score,
  maxScore,
  percentile,
  metrics = [],
  actions,
  className = '',
}) => {
  const containerStyle: React.CSSProperties = {
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.xl,
    boxShadow: tokens.shadows.medium,
    maxWidth: '500px',
    width: '100%',
    margin: '0 auto',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: tokens.fontSizes.xxl,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.text,
    textAlign: 'center',
    marginBottom: tokens.spacing.lg,
    fontFamily: tokens.fonts.title,
  };

  const scoreContainerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
  };

  const scoreStyle: React.CSSProperties = {
    fontSize: tokens.fontSizes.xxxl,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.primary,
    lineHeight: 1,
  };

  const scoreLabelStyle: React.CSSProperties = {
    fontSize: tokens.fontSizes.md,
    color: tokens.colors.textSecondary,
    marginTop: tokens.spacing.sm,
  };

  const percentileStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: tokens.fontSizes.xl,
    fontWeight: tokens.fontWeights.semibold,
    color: tokens.colors.success,
    marginBottom: tokens.spacing.lg,
  };

  const metricsContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
  };

  const metricStyle: React.CSSProperties = {
    backgroundColor: tokens.colors.background,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    textAlign: 'center',
  };

  const metricLabelStyle: React.CSSProperties = {
    fontSize: tokens.fontSizes.xs,
    color: tokens.colors.textSecondary,
    marginBottom: tokens.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const metricValueStyle: React.CSSProperties = {
    fontSize: tokens.fontSizes.lg,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.text,
  };

  const actionsContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing.md,
    justifyContent: 'center',
    marginTop: tokens.spacing.xl,
  };

  return (
    <div style={containerStyle} className={className}>
      <h2 style={titleStyle}>{title}</h2>

      <div style={scoreContainerStyle}>
        <div style={scoreStyle}>
          {score}
          {maxScore && <span style={{ fontSize: '0.5em', opacity: 0.6 }}>/{maxScore}</span>}
        </div>
        <div style={scoreLabelStyle}>Final Score</div>
      </div>

      {percentile !== undefined && (
        <div style={percentileStyle}>
          Top {100 - percentile}%
        </div>
      )}

      {metrics.length > 0 && (
        <div style={metricsContainerStyle}>
          {metrics.map((metric, index) => (
            <div key={index} style={metricStyle}>
              {metric.icon && (
                <div style={{ fontSize: tokens.fontSizes.xl, marginBottom: tokens.spacing.xs }}>
                  {metric.icon}
                </div>
              )}
              <div style={metricLabelStyle}>{metric.label}</div>
              <div style={metricValueStyle}>{metric.value}</div>
            </div>
          ))}
        </div>
      )}

      {actions && <div style={actionsContainerStyle}>{actions}</div>}
    </div>
  );
};
