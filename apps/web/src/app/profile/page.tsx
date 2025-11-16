/**
 * Brainprint Profile Page
 * Showcase cognitive profile with radial glyph, insights, and evolution
 */

'use client';

import React, { useMemo, useState } from 'react';
import { telemetry } from '@sil/core';
import type { GameSessionEndEvent } from '@sil/core';
import { ALL_GAMES } from '@sil/games';
import { type PlayerProgress, initializeProgress, xpProgressToNextLevel } from '@sil/core/progression';

const BRAINPRINT_DIMENSIONS = [
  { id: 'semantic_precision', name: 'Semantic Precision', description: 'Accuracy in semantic judgments' },
  { id: 'associative_range', name: 'Associative Range', description: 'Breadth of conceptual connections' },
  { id: 'analogical_reasoning', name: 'Analogical Reasoning', description: 'Pattern transfer and analogy detection' },
  { id: 'creative_divergence', name: 'Creative Divergence', description: 'Rare and creative solution finding' },
  { id: 'convergent_selection', name: 'Convergent Selection', description: 'Optimal choice identification' },
  { id: 'rarity_sensitivity', name: 'Rarity Sensitivity', description: 'Uncommon pattern detection' },
  { id: 'conceptual_navigation', name: 'Conceptual Navigation', description: 'Semantic space traversal' },
  { id: 'inference_stability', name: 'Inference Stability', description: 'Consistent logical deduction' },
  { id: 'executive_filtering', name: 'Executive Filtering', description: 'Attention control and filtering' },
  { id: 'affective_resonance', name: 'Affective Resonance', description: 'Emotional-conceptual mapping' },
];

export default function ProfilePage() {
  const [showDeepScience, setShowDeepScience] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  // Load progress (mock for now)
  const progress = useMemo(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('player_progress');
      if (stored) return JSON.parse(stored) as PlayerProgress;
    }
    return initializeProgress('user-profile');
  }, []);

  const xpInfo = useMemo(() => xpProgressToNextLevel(progress.xp), [progress.xp]);

  // Get all game sessions for brainprint calculation
  const events = useMemo(() => telemetry.getEvents(), []);
  const gameSessions = useMemo(() => {
    const now = Date.now();
    const ranges = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      all: Infinity,
    };
    const cutoff = now - ranges[timeRange];

    return events.filter(e =>
      e.type === 'game_session_end' &&
      e.timestamp >= cutoff
    ) as GameSessionEndEvent[];
  }, [events, timeRange]);

  // Calculate brainprint from skill signals
  const brainprint = useMemo(() => {
    const dimensionScores: Record<string, number[]> = {};

    gameSessions.forEach(session => {
      if (session.metadata.skillSignals) {
        Object.entries(session.metadata.skillSignals).forEach(([skill, value]) => {
          if (!dimensionScores[skill]) dimensionScores[skill] = [];
          dimensionScores[skill].push(value);
        });
      }
    });

    // Calculate averages for each dimension
    return BRAINPRINT_DIMENSIONS.map(dim => {
      const scores = dimensionScores[dim.id] || [];
      const avgScore = scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : 50; // Default middle value

      // Mock percentile (would be calculated from all users)
      const percentile = Math.min(95, Math.max(5, avgScore + Math.random() * 10 - 5));

      // Mock trend (would be calculated from historical data)
      const trend = Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable';

      return {
        ...dim,
        score: avgScore,
        percentile,
        trend,
        gamesContributed: scores.length,
      };
    });
  }, [gameSessions]);

  // Get top games for each dimension
  const topGamesPerDimension = useMemo(() => {
    const gameScores: Record<string, Record<string, { sum: number; count: number }>> = {};

    gameSessions.forEach(session => {
      const gameId = session.metadata.gameId;
      if (!gameScores[gameId]) gameScores[gameId] = {};

      if (session.metadata.skillSignals) {
        Object.entries(session.metadata.skillSignals).forEach(([skill, value]) => {
          if (!gameScores[gameId][skill]) {
            gameScores[gameId][skill] = { sum: 0, count: 0 };
          }
          gameScores[gameId][skill].sum += value;
          gameScores[gameId][skill].count += 1;
        });
      }
    });

    const result: Record<string, { gameId: string; avgScore: number }[]> = {};

    BRAINPRINT_DIMENSIONS.forEach(dim => {
      const scores = Object.entries(gameScores)
        .map(([gameId, skills]) => ({
          gameId,
          avgScore: skills[dim.id] ? skills[dim.id].sum / skills[dim.id].count : 0,
        }))
        .filter(g => g.avgScore > 0)
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, 3);

      result[dim.id] = scores;
    });

    return result;
  }, [gameSessions]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Your Brainprint
          </h1>
          <p className="text-xl text-slate-300">
            Cognitive profile across 10 intelligence dimensions
          </p>
        </div>

        {/* XP & Level */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-8">
            <div className="text-sm text-blue-300 uppercase font-semibold mb-2">Level</div>
            <div className="text-6xl font-bold text-blue-400 mb-2">{progress.level}</div>
            <div className="text-slate-300">
              {xpInfo.xpProgress} / {xpInfo.xpForNextLevel} XP to level {progress.level + 1}
            </div>
            <div className="mt-4 w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all"
                style={{ width: `${xpInfo.percentage}%` }}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-8">
            <div className="text-sm text-orange-300 uppercase font-semibold mb-2">Streak</div>
            <div className="text-6xl font-bold text-orange-400 flex items-center gap-3">
              <span>🔥</span>
              <span>{progress.streak}</span>
            </div>
            <div className="text-slate-300 mt-2">Days in a row</div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-8">
            <div className="text-sm text-green-300 uppercase font-semibold mb-2">Games Played</div>
            <div className="text-6xl font-bold text-green-400">{progress.stats.totalGamesPlayed}</div>
            <div className="text-slate-300 mt-2">
              Avg score: {Math.round(progress.stats.avgScore)}
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-center gap-4 mb-8">
          {(['week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Last {range === 'all' ? 'All Time' : range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        {/* Radial Glyph */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Cognitive Dimensions</h2>

          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Radar Chart (SVG) */}
            <div className="flex-shrink-0">
              <RadarChart dimensions={brainprint} />
            </div>

            {/* Dimension List */}
            <div className="flex-1 space-y-4">
              {brainprint.map((dim) => (
                <div key={dim.id} className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{dim.name}</h3>
                      <p className="text-sm text-slate-400">{dim.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-400">{Math.round(dim.score)}</div>
                      <div className="text-xs text-slate-500">{Math.round(dim.percentile)}th percentile</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full"
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>

                  {/* Trend */}
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className={`flex items-center gap-1 ${
                      dim.trend === 'up' ? 'text-green-400' :
                      dim.trend === 'down' ? 'text-red-400' :
                      'text-slate-400'
                    }`}>
                      {dim.trend === 'up' && '📈 Improving'}
                      {dim.trend === 'down' && '📉 Declining'}
                      {dim.trend === 'stable' && '➡️ Stable'}
                    </span>
                    <span className="text-slate-500">• {dim.gamesContributed} games</span>
                  </div>

                  {/* Top Games */}
                  {topGamesPerDimension[dim.id] && topGamesPerDimension[dim.id].length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs text-slate-500">Top games:</span>
                      {topGamesPerDimension[dim.id].slice(0, 3).map(({ gameId }) => {
                        const game = ALL_GAMES.find(g => g.id === gameId);
                        return (
                          <span key={gameId} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            {game?.name || gameId}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Badges */}
        {progress.badges.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold mb-6">Badges Earned</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {progress.badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`bg-slate-800 rounded-lg p-4 text-center border ${
                    badge.rarity === 'legendary' ? 'border-yellow-500' :
                    badge.rarity === 'epic' ? 'border-purple-500' :
                    badge.rarity === 'rare' ? 'border-blue-500' :
                    'border-slate-700'
                  }`}
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <div className="font-bold text-sm">{badge.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{badge.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deep Science View */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Deep Science View</h2>
            <button
              onClick={() => setShowDeepScience(!showDeepScience)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              {showDeepScience ? 'Hide' : 'Show'} Details
            </button>
          </div>

          {showDeepScience && (
            <div className="space-y-6">
              <p className="text-slate-300 mb-6">
                Your brainprint is calculated from skill signals emitted by each game you play.
                Here's exactly how each game contributed to your profile:
              </p>

              {/* Game Contributions */}
              <div className="space-y-4">
                {Array.from(new Set(gameSessions.map(s => s.metadata.gameId))).slice(0, 10).map(gameId => {
                  const game = ALL_GAMES.find(g => g.id === gameId);
                  const sessions = gameSessions.filter(s => s.metadata.gameId === gameId);
                  const avgScore = sessions.reduce((sum, s) => sum + s.metadata.score, 0) / sessions.length;

                  return (
                    <div key={gameId} className="bg-slate-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg">{game?.name || gameId}</h3>
                        <div className="text-right">
                          <div className="text-sm text-slate-400">{sessions.length} sessions</div>
                          <div className="text-sm text-slate-400">Avg: {Math.round(avgScore)}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {sessions[0]?.metadata.skillSignals && Object.entries(sessions[0].metadata.skillSignals).map(([skill, value]) => (
                          <div key={skill} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                            {skill.replace('_', ' ')}: {Math.round(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/**
 * Radar Chart Component
 */
function RadarChart({ dimensions }: { dimensions: any[] }) {
  const size = 400;
  const center = size / 2;
  const radius = size / 2 - 40;
  const angleStep = (2 * Math.PI) / dimensions.length;

  // Calculate points for the polygon
  const points = dimensions.map((dim, i) => {
    const angle = i * angleStep - Math.PI / 2; // Start from top
    const distance = (dim.score / 100) * radius;
    const x = center + distance * Math.cos(angle);
    const y = center + distance * Math.sin(angle);
    return { x, y, dim };
  });

  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // Grid circles
  const gridCircles = [0.25, 0.5, 0.75, 1.0].map(ratio => ({
    r: radius * ratio,
    opacity: ratio === 1.0 ? 0.3 : 0.1,
  }));

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Grid circles */}
      {gridCircles.map((circle, i) => (
        <circle
          key={i}
          cx={center}
          cy={center}
          r={circle.r}
          fill="none"
          stroke="rgb(148, 163, 184)"
          strokeOpacity={circle.opacity}
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {points.map((point, i) => (
        <line
          key={i}
          x1={center}
          y1={center}
          x2={center + radius * Math.cos(i * angleStep - Math.PI / 2)}
          y2={center + radius * Math.sin(i * angleStep - Math.PI / 2)}
          stroke="rgb(148, 163, 184)"
          strokeOpacity="0.2"
          strokeWidth="1"
        />
      ))}

      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        fill="url(#gradient)"
        fillOpacity="0.3"
        stroke="rgb(139, 92, 246)"
        strokeWidth="2"
      />

      {/* Data points */}
      {points.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="5"
          fill="rgb(139, 92, 246)"
        />
      ))}

      {/* Labels */}
      {points.map((point, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const labelDistance = radius + 30;
        const x = center + labelDistance * Math.cos(angle);
        const y = center + labelDistance * Math.sin(angle);

        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-slate-300"
            style={{ fontSize: '10px' }}
          >
            {point.dim.name.split(' ')[0]}
          </text>
        );
      })}

      {/* Gradient definition */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(59, 130, 246)" />
          <stop offset="100%" stopColor="rgb(168, 85, 247)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
