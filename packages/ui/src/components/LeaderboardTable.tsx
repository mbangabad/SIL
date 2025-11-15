/**
 * LeaderboardTable Component
 *
 * Displays leaderboard rankings in table format
 * Shows ranks, usernames, scores, and badges
 */

import React from 'react';
import { tokens } from '../tokens';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string | null;
  displayName: string | null;
  score: number;
  percentile?: number;
  gamesPlayed?: number;
  isCurrentUser?: boolean;
}

export interface LeaderboardTableProps {
  /** Leaderboard entries to display */
  entries: LeaderboardEntry[];
  /** Current user ID (to highlight their row) */
  currentUserId?: string;
  /** Show percentile column */
  showPercentile?: boolean;
  /** Show games played column */
  showGamesPlayed?: boolean;
  /** Title */
  title?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Custom CSS class */
  className?: string;
}

/**
 * Get medal emoji for top 3
 */
function getMedal(rank: number): string | null {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

/**
 * Get tier badge color based on percentile
 */
function getTierColor(percentile: number): string {
  if (percentile >= 95) return '#a78bfa'; // Diamond - purple
  if (percentile >= 85) return '#60a5fa'; // Platinum - light blue
  if (percentile >= 70) return '#fbbf24'; // Gold - yellow
  if (percentile >= 50) return '#9ca3af'; // Silver - gray
  return '#f97316'; // Bronze - orange
}

/**
 * Format display name
 */
function getDisplayName(entry: LeaderboardEntry): string {
  return entry.displayName || entry.username || `User ${entry.userId.slice(0, 8)}`;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  currentUserId,
  showPercentile = false,
  showGamesPlayed = false,
  title,
  emptyMessage = 'No entries yet. Be the first!',
  className = '',
}) => {
  const containerStyle: React.CSSProperties = {
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.xl,
    boxShadow: tokens.shadows.soft,
    width: '100%',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: tokens.fontSizes.xl,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.lg,
    fontFamily: tokens.fonts.title,
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: tokens.spacing.md,
    fontSize: tokens.fontSizes.xs,
    color: tokens.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: tokens.fontWeights.semibold,
    borderBottom: `2px solid ${tokens.colors.background}`,
  };

  if (entries.length === 0) {
    return (
      <div className={className} style={containerStyle}>
        {title && <h3 style={titleStyle}>{title}</h3>}
        <div
          style={{
            textAlign: 'center',
            padding: tokens.spacing.xl,
            color: tokens.colors.textSecondary,
          }}
        >
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={containerStyle}>
      {title && <h3 style={titleStyle}>{title}</h3>}

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: '60px' }}>Rank</th>
            <th style={thStyle}>Player</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Score</th>
            {showPercentile && (
              <th style={{ ...thStyle, textAlign: 'right' }}>Tier</th>
            )}
            {showGamesPlayed && (
              <th style={{ ...thStyle, textAlign: 'right' }}>Games</th>
            )}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const isCurrentUser = entry.userId === currentUserId;
            const medal = getMedal(entry.rank);

            const rowStyle: React.CSSProperties = {
              backgroundColor: isCurrentUser
                ? tokens.colors.primary + '15'
                : index % 2 === 0
                ? 'transparent'
                : tokens.colors.background + '80',
              borderLeft: isCurrentUser
                ? `3px solid ${tokens.colors.primary}`
                : '3px solid transparent',
            };

            const tdStyle: React.CSSProperties = {
              padding: tokens.spacing.md,
              fontSize: tokens.fontSizes.md,
              color: tokens.colors.text,
              borderBottom: `1px solid ${tokens.colors.background}`,
            };

            return (
              <tr key={entry.userId} style={rowStyle}>
                <td style={{ ...tdStyle, fontWeight: tokens.fontWeights.bold }}>
                  {medal ? (
                    <span style={{ fontSize: tokens.fontSizes.xl }}>{medal}</span>
                  ) : (
                    `#${entry.rank}`
                  )}
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
                    <div>
                      <div style={{ fontWeight: tokens.fontWeights.semibold }}>
                        {getDisplayName(entry)}
                      </div>
                      {isCurrentUser && (
                        <div
                          style={{
                            fontSize: tokens.fontSizes.xs,
                            color: tokens.colors.primary,
                          }}
                        >
                          You
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td
                  style={{
                    ...tdStyle,
                    textAlign: 'right',
                    fontWeight: tokens.fontWeights.bold,
                    color: tokens.colors.primary,
                  }}
                >
                  {entry.score}
                </td>
                {showPercentile && entry.percentile !== undefined && (
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
                        borderRadius: tokens.radius.md,
                        backgroundColor: getTierColor(entry.percentile),
                        color: tokens.colors.text,
                        fontSize: tokens.fontSizes.xs,
                        fontWeight: tokens.fontWeights.bold,
                      }}
                    >
                      {entry.percentile}%
                    </span>
                  </td>
                )}
                {showGamesPlayed && (
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: 'right',
                      color: tokens.colors.textSecondary,
                    }}
                  >
                    {entry.gamesPlayed || 1}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
