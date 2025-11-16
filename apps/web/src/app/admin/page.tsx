/**
 * Admin Dashboard
 * Analytics and metrics for SIL platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import { telemetry } from '@sil/core';
import type { TelemetryEvent, GameSessionEndEvent } from '@sil/core';
import { ALL_GAMES } from '@sil/games';

export default function AdminDashboard() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('week');

  // Get all events from telemetry
  const events = useMemo(() => telemetry.getEvents(), []);

  // Calculate date range
  const now = Date.now();
  const timeRangeMs = {
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    all: Infinity,
  };

  const filteredEvents = useMemo(() => {
    const cutoff = now - timeRangeMs[timeRange];
    return events.filter((e) => e.timestamp >= cutoff);
  }, [events, timeRange, now]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const gameEndEvents = filteredEvents.filter(
      (e) => e.type === 'game_session_end'
    ) as GameSessionEndEvent[];

    const pageViewEvents = filteredEvents.filter((e) => e.type === 'page_view');
    const errorEvents = filteredEvents.filter((e) => e.type === 'error');

    // Unique users (by userId or sessionId)
    const uniqueUsers = new Set(
      filteredEvents.map((e) => e.userId || e.sessionId).filter(Boolean)
    ).size;

    // DAU/WAU/MAU
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const dau = new Set(
      filteredEvents
        .filter((e) => e.timestamp >= oneDayAgo)
        .map((e) => e.userId || e.sessionId)
        .filter(Boolean)
    ).size;

    const wau = new Set(
      filteredEvents
        .filter((e) => e.timestamp >= oneWeekAgo)
        .map((e) => e.userId || e.sessionId)
        .filter(Boolean)
    ).size;

    const mau = new Set(
      filteredEvents
        .filter((e) => e.timestamp >= oneMonthAgo)
        .map((e) => e.userId || e.sessionId)
        .filter(Boolean)
    ).size;

    // Average score
    const scores = gameEndEvents.map((e) => e.metadata.score);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    // Average session duration
    const durations = gameEndEvents.map((e) => e.metadata.durationMs);
    const avgDuration =
      durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    // Completion rate
    const completed = gameEndEvents.filter((e) => e.metadata.completed).length;
    const completionRate = gameEndEvents.length > 0 ? (completed / gameEndEvents.length) * 100 : 0;

    // Sessions per game
    const sessionsByGame = gameEndEvents.reduce((acc, e) => {
      acc[e.metadata.gameId] = (acc[e.metadata.gameId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sessions per mode
    const sessionsByMode = gameEndEvents.reduce((acc, e) => {
      acc[e.metadata.mode] = (acc[e.metadata.mode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSessions: gameEndEvents.length,
      uniqueUsers,
      dau,
      wau,
      mau,
      avgScore: Math.round(avgScore * 10) / 10,
      avgDuration: Math.round(avgDuration),
      completionRate: Math.round(completionRate * 10) / 10,
      sessionsByGame,
      sessionsByMode,
      pageViews: pageViewEvents.length,
      errors: errorEvents.length,
    };
  }, [filteredEvents, now]);

  // Per-game analytics
  const gameAnalytics = useMemo(() => {
    if (!selectedGame) return null;

    const gameEvents = filteredEvents.filter(
      (e) => e.type === 'game_session_end' && e.metadata.gameId === selectedGame
    ) as GameSessionEndEvent[];

    const scores = gameEvents.map((e) => e.metadata.score);
    const durations = gameEvents.map((e) => e.metadata.durationMs);

    // Score distribution (buckets)
    const scoreBuckets = [0, 20, 40, 60, 80, 100];
    const scoreDistribution = scoreBuckets.map((bucket, i) => {
      const nextBucket = scoreBuckets[i + 1] || 101;
      const count = scores.filter((s) => s >= bucket && s < nextBucket).length;
      return { range: `${bucket}-${nextBucket - 1}`, count };
    });

    // Sessions by mode
    const sessionsByMode = gameEvents.reduce((acc, e) => {
      acc[e.metadata.mode] = (acc[e.metadata.mode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Average score by mode
    const avgScoreByMode = Object.keys(sessionsByMode).reduce((acc, mode) => {
      const modeScores = gameEvents.filter((e) => e.metadata.mode === mode).map((e) => e.metadata.score);
      acc[mode] = modeScores.length > 0 ? modeScores.reduce((a, b) => a + b, 0) / modeScores.length : 0;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSessions: gameEvents.length,
      avgScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      avgDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      scoreDistribution,
      sessionsByMode,
      avgScoreByMode,
    };
  }, [selectedGame, filteredEvents]);

  // Brainprint analytics
  const brainprintAnalytics = useMemo(() => {
    const gameEndEvents = filteredEvents.filter(
      (e) => e.type === 'game_session_end'
    ) as GameSessionEndEvent[];

    const allSkillSignals: Record<string, number[]> = {};

    gameEndEvents.forEach((e) => {
      if (e.metadata.skillSignals) {
        Object.entries(e.metadata.skillSignals).forEach(([skill, value]) => {
          if (!allSkillSignals[skill]) {
            allSkillSignals[skill] = [];
          }
          allSkillSignals[skill].push(value);
        });
      }
    });

    const skillAverages = Object.entries(allSkillSignals).map(([skill, values]) => ({
      skill,
      avgValue: values.reduce((a, b) => a + b, 0) / values.length,
      count: values.length,
    }));

    return skillAverages.sort((a, b) => b.count - a.count);
  }, [filteredEvents]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-400">Platform analytics and metrics</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-8 flex gap-4">
          {(['day', 'week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {range === 'all' ? 'All Time' : `Last ${range.charAt(0).toUpperCase() + range.slice(1)}`}
            </button>
          ))}
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard label="Total Sessions" value={metrics.totalSessions} />
          <MetricCard label="DAU" value={metrics.dau} />
          <MetricCard label="WAU" value={metrics.wau} />
          <MetricCard label="MAU" value={metrics.mau} />
          <MetricCard label="Avg Score" value={metrics.avgScore} />
          <MetricCard label="Avg Duration" value={`${Math.round(metrics.avgDuration / 1000)}s`} />
          <MetricCard label="Completion Rate" value={`${metrics.completionRate}%`} />
          <MetricCard label="Errors" value={metrics.errors} color="red" />
        </div>

        {/* Sessions by Game */}
        <div className="mb-8 bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-2xl font-bold mb-4">Sessions by Game</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(metrics.sessionsByGame)
              .sort(([, a], [, b]) => b - a)
              .map(([gameId, count]) => {
                const game = ALL_GAMES.find((g) => g.id === gameId);
                return (
                  <button
                    key={gameId}
                    onClick={() => setSelectedGame(gameId)}
                    className={`p-4 rounded-lg transition-all ${
                      selectedGame === gameId
                        ? 'bg-blue-500 border-blue-400'
                        : 'bg-slate-800 hover:bg-slate-700'
                    } border border-slate-700`}
                  >
                    <div className="text-lg font-bold">{game?.name || gameId}</div>
                    <div className="text-2xl font-bold text-blue-400">{count}</div>
                    <div className="text-xs text-slate-400">sessions</div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Sessions by Mode */}
        <div className="mb-8 bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-2xl font-bold mb-4">Sessions by Mode</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(metrics.sessionsByMode).map(([mode, count]) => (
              <div key={mode} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="text-lg font-bold capitalize">{mode}</div>
                <div className="text-3xl font-bold text-purple-400">{count}</div>
                <div className="text-xs text-slate-400">sessions</div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-Game Analytics */}
        {selectedGame && gameAnalytics && (
          <div className="mb-8 bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {ALL_GAMES.find((g) => g.id === selectedGame)?.name || selectedGame} Analytics
              </h2>
              <button
                onClick={() => setSelectedGame(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <MetricCard label="Total Sessions" value={gameAnalytics.totalSessions} />
              <MetricCard label="Avg Score" value={Math.round(gameAnalytics.avgScore * 10) / 10} />
              <MetricCard
                label="Avg Duration"
                value={`${Math.round(gameAnalytics.avgDuration / 1000)}s`}
              />
            </div>

            {/* Score Distribution */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3">Score Distribution</h3>
              <div className="space-y-2">
                {gameAnalytics.scoreDistribution.map(({ range, count }) => {
                  const maxCount = Math.max(...gameAnalytics.scoreDistribution.map((d) => d.count));
                  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  return (
                    <div key={range} className="flex items-center gap-4">
                      <div className="w-16 text-sm text-slate-400">{range}</div>
                      <div className="flex-1 bg-slate-800 rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full flex items-center justify-end pr-2"
                          style={{ width: `${percentage}%` }}
                        >
                          {count > 0 && <span className="text-sm font-bold">{count}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Avg Score by Mode */}
            <div>
              <h3 className="text-xl font-bold mb-3">Average Score by Mode</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(gameAnalytics.avgScoreByMode).map(([mode, score]) => (
                  <div key={mode} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="text-sm text-slate-400 capitalize">{mode}</div>
                    <div className="text-2xl font-bold text-green-400">
                      {Math.round(score * 10) / 10}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Brainprint Analytics */}
        <div className="mb-8 bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-2xl font-bold mb-4">Brainprint Analytics</h2>
          {brainprintAnalytics.length === 0 ? (
            <p className="text-slate-400">No skill signal data available</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {brainprintAnalytics.map(({ skill, avgValue, count }) => (
                <div key={skill} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <div className="text-sm text-slate-400 capitalize mb-1">{skill}</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.round(avgValue * 10) / 10}
                  </div>
                  <div className="text-xs text-slate-500">{count} samples</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Events */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-2xl font-bold mb-4">Recent Events</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-4">Type</th>
                  <th className="text-left py-2 px-4">Timestamp</th>
                  <th className="text-left py-2 px-4">User/Session</th>
                  <th className="text-left py-2 px-4">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents
                  .slice(-20)
                  .reverse()
                  .map((event) => (
                    <tr key={event.eventId} className="border-b border-slate-800 hover:bg-slate-800">
                      <td className="py-2 px-4">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                          {event.type}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-slate-400">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 text-slate-400 font-mono text-xs">
                        {(event.userId || event.sessionId || 'anonymous').slice(0, 16)}...
                      </td>
                      <td className="py-2 px-4 text-slate-400 text-xs">
                        {event.type === 'game_session_end' && (
                          <span>
                            {event.metadata.gameId} ({event.metadata.mode}) - Score:{' '}
                            {event.metadata.score}
                          </span>
                        )}
                        {event.type === 'game_session_start' && (
                          <span>
                            {event.metadata.gameId} ({event.metadata.mode})
                          </span>
                        )}
                        {event.type === 'error' && <span className="text-red-400">{event.metadata.errorMessage}</span>}
                        {event.type === 'page_view' && <span>{event.metadata.path}</span>}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Metric Card Component
 */
function MetricCard({
  label,
  value,
  color = 'blue',
}: {
  label: string;
  value: string | number;
  color?: 'blue' | 'green' | 'purple' | 'red';
}) {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    red: 'text-red-400',
  };

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <div className="text-sm text-slate-400 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</div>
    </div>
  );
}
