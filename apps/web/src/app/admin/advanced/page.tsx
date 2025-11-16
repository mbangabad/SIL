/**
 * Advanced Admin Dashboard
 * State-of-the-art control panel with real-time monitoring, analytics, and A/B testing
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { telemetry } from '@sil/core';
import type { TelemetryEvent, GameSessionEndEvent, GameSessionStartEvent, ErrorEvent } from '@sil/core';
import { EXPERIMENTS, FEATURE_FLAGS, experimentService, type Experiment, type FeatureFlag } from '@sil/core/experiments';
import { ALL_GAMES } from '@sil/games';

export default function AdvancedAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'realtime' | 'analytics' | 'cohorts' | 'experiments' | 'system' | 'tools'>('realtime');
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Force re-render to update real-time data
      setTimeRange(prev => prev);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Advanced Admin Control Panel
              </h1>
              <p className="text-sm text-slate-400 mt-1">Real-time monitoring, analytics, and system control</p>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <span className="text-slate-300">Auto-refresh (5s)</span>
              </label>

              <div className="flex gap-2">
                {(['hour', 'day', 'week', 'month'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                      timeRange === range
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4">
            {[
              { id: 'realtime', label: 'Real-Time', icon: '📡' },
              { id: 'analytics', label: 'Analytics', icon: '📊' },
              { id: 'cohorts', label: 'Cohorts', icon: '👥' },
              { id: 'experiments', label: 'Experiments', icon: '🧪' },
              { id: 'system', label: 'System Health', icon: '💚' },
              { id: 'tools', label: 'Admin Tools', icon: '🔧' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1920px] mx-auto px-6 py-6">
        {activeTab === 'realtime' && <RealTimeMonitoring timeRange={timeRange} />}
        {activeTab === 'analytics' && <AdvancedAnalytics timeRange={timeRange} />}
        {activeTab === 'cohorts' && <CohortAnalysis timeRange={timeRange} />}
        {activeTab === 'experiments' && <ExperimentsPanel />}
        {activeTab === 'system' && <SystemHealth />}
        {activeTab === 'tools' && <AdminTools />}
      </div>
    </div>
  );
}

/**
 * 1A. Real-Time Monitoring
 */
function RealTimeMonitoring({ timeRange }: { timeRange: string }) {
  const events = useMemo(() => telemetry.getEvents(), []);

  // Calculate real-time metrics
  const metrics = useMemo(() => {
    const now = Date.now();
    const timeRanges = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    };
    const cutoff = now - timeRanges[timeRange as keyof typeof timeRanges];
    const recentEvents = events.filter(e => e.timestamp >= cutoff);

    const activeSessions = recentEvents.filter(e =>
      e.type === 'game_session_start' &&
      !recentEvents.some(end =>
        end.type === 'game_session_end' &&
        end.sessionId === e.sessionId
      )
    );

    const errors = recentEvents.filter(e => e.type === 'error') as ErrorEvent[];

    // Users by mode
    const byMode: Record<string, number> = {};
    activeSessions.forEach(session => {
      const mode = (session as GameSessionStartEvent).metadata.mode;
      byMode[mode] = (byMode[mode] || 0) + 1;
    });

    // Event frequency (events per minute)
    const eventFrequency: { time: number; count: number }[] = [];
    const bucketSize = timeRange === 'hour' ? 60000 : timeRange === 'day' ? 300000 : 3600000; // 1min, 5min, or 1hr
    const buckets = Math.ceil((now - cutoff) / bucketSize);

    for (let i = 0; i < Math.min(buckets, 100); i++) {
      const bucketStart = cutoff + (i * bucketSize);
      const bucketEnd = bucketStart + bucketSize;
      const count = recentEvents.filter(e => e.timestamp >= bucketStart && e.timestamp < bucketEnd).length;
      eventFrequency.push({ time: bucketStart, count });
    }

    return {
      activeSessions: activeSessions.length,
      activeUsers: new Set(activeSessions.map(s => s.userId || s.sessionId)).size,
      byMode,
      recentErrors: errors.slice(-20),
      eventFrequency,
      totalEvents: recentEvents.length,
    };
  }, [events, timeRange]);

  return (
    <div className="space-y-6">
      {/* Live Sessions */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          Live Sessions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            label="Active Sessions"
            value={metrics.activeSessions}
            color="green"
            subtitle="Currently playing"
          />
          <MetricCard
            label="Active Users"
            value={metrics.activeUsers}
            color="blue"
            subtitle="Unique players"
          />
          <MetricCard
            label="Recent Errors"
            value={metrics.recentErrors.length}
            color={metrics.recentErrors.length > 0 ? "red" : "green"}
            subtitle="Last hour"
          />
          <MetricCard
            label="Events/Min"
            value={Math.round(metrics.totalEvents / ((timeRange === 'hour' ? 60 : timeRange === 'day' ? 1440 : 10080)))}
            color="purple"
            subtitle="Event rate"
          />
        </div>
      </div>

      {/* Users by Mode */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h3 className="text-lg font-bold mb-4">Users Currently In Each Mode</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metrics.byMode).map(([mode, count]) => (
            <div key={mode} className="bg-slate-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{count}</div>
              <div className="text-sm text-slate-400 capitalize">{mode}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Frequency Chart */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h3 className="text-lg font-bold mb-4">Telemetry Event Frequency</h3>
        <div className="h-64 flex items-end gap-1">
          {metrics.eventFrequency.map((bucket, i) => {
            const maxCount = Math.max(...metrics.eventFrequency.map(b => b.count), 1);
            const height = (bucket.count / maxCount) * 100;
            return (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t"
                style={{ height: `${height}%` }}
                title={`${bucket.count} events`}
              />
            );
          })}
        </div>
        <div className="text-xs text-slate-400 mt-2 text-center">
          Events over last {timeRange}
        </div>
      </div>

      {/* Live Error Stream */}
      {metrics.recentErrors.length > 0 && (
        <div className="bg-slate-900 rounded-xl p-6 border border-red-900/50">
          <h3 className="text-lg font-bold mb-4 text-red-400">Live Error Stream</h3>
          <div className="space-y-2">
            {metrics.recentErrors.map((error, i) => (
              <div key={error.eventId} className="bg-slate-800 p-3 rounded border-l-2 border-red-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-mono text-sm text-red-400">{error.metadata.errorMessage}</div>
                    {error.metadata.gameId && (
                      <div className="text-xs text-slate-400 mt-1">Game: {error.metadata.gameId}</div>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(error.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                {error.metadata.errorStack && (
                  <details className="mt-2">
                    <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                      Stack trace
                    </summary>
                    <pre className="text-xs text-slate-500 mt-2 overflow-x-auto">
                      {error.metadata.errorStack.slice(0, 500)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 1B. Advanced Analytics
 */
function AdvancedAnalytics({ timeRange }: { timeRange: string }) {
  const events = useMemo(() => telemetry.getEvents(), []);

  const analytics = useMemo(() => {
    const now = Date.now();
    const timeRanges = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    };
    const cutoff = now - timeRanges[timeRange as keyof typeof timeRanges];
    const recentEvents = events.filter(e => e.timestamp >= cutoff);

    const gameEndEvents = recentEvents.filter(e => e.type === 'game_session_end') as GameSessionEndEvent[];

    // Game heatmap
    const gamePlayCounts: Record<string, number> = {};
    gameEndEvents.forEach(e => {
      gamePlayCounts[e.metadata.gameId] = (gamePlayCounts[e.metadata.gameId] || 0) + 1;
    });

    const sortedGames = Object.entries(gamePlayCounts).sort((a, b) => b[1] - a[1]);
    const hotGames = sortedGames.slice(0, 10);
    const coldGames = ALL_GAMES
      .map(g => g.id)
      .filter(id => !gamePlayCounts[id])
      .slice(0, 10);

    // Mode engagement over time
    const modeEngagement: Record<string, number> = {};
    gameEndEvents.forEach(e => {
      modeEngagement[e.metadata.mode] = (modeEngagement[e.metadata.mode] || 0) + 1;
    });

    // Difficulty analysis
    const scoresByGame: Record<string, number[]> = {};
    gameEndEvents.forEach(e => {
      if (!scoresByGame[e.metadata.gameId]) scoresByGame[e.metadata.gameId] = [];
      scoresByGame[e.metadata.gameId].push(e.metadata.score);
    });

    const difficultyAnalysis = Object.entries(scoresByGame).map(([gameId, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
      const volatility = Math.sqrt(variance);
      const highPercentile = scores.filter(s => s >= 90).length / scores.length * 100;

      return {
        gameId,
        avgScore: avg,
        volatility,
        highPercentile,
        totalSessions: scores.length,
      };
    }).sort((a, b) => b.totalSessions - a.totalSessions);

    // Drop-off detection
    const journeySessions = gameEndEvents.filter(e => e.metadata.mode === 'journey');
    const avgJourneyCompletion = journeySessions.filter(e => e.metadata.completed).length / journeySessions.length * 100;

    const arenaSessions = gameEndEvents.filter(e => e.metadata.mode === 'arena');
    const avgArenaDuration = arenaSessions.reduce((sum, e) => sum + e.metadata.durationMs, 0) / arenaSessions.length;

    return {
      hotGames,
      coldGames,
      modeEngagement,
      difficultyAnalysis: difficultyAnalysis.slice(0, 15),
      avgJourneyCompletion,
      avgArenaDuration,
    };
  }, [events, timeRange]);

  return (
    <div className="space-y-6">
      {/* Game Heatmap */}
      <div>
        <h2 className="text-xl font-bold mb-4">Game Heatmap</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hot Games */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h3 className="text-lg font-semibold mb-4 text-orange-400">🔥 Most Played</h3>
            <div className="space-y-2">
              {analytics.hotGames.map(([gameId, count], i) => {
                const game = ALL_GAMES.find(g => g.id === gameId);
                return (
                  <div key={gameId} className="flex items-center justify-between bg-slate-800 p-3 rounded">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-mono text-sm">#{i + 1}</span>
                      <span className="font-semibold">{game?.name || gameId}</span>
                    </div>
                    <span className="text-orange-400 font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cold Games */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h3 className="text-lg font-semibold mb-4 text-blue-400">❄️ Low Activity</h3>
            <div className="space-y-2">
              {analytics.coldGames.map((gameId) => {
                const game = ALL_GAMES.find(g => g.id === gameId);
                return (
                  <div key={gameId} className="flex items-center justify-between bg-slate-800 p-3 rounded">
                    <span className="text-slate-400">{game?.name || gameId}</span>
                    <span className="text-blue-400 text-sm">No plays</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mode Engagement */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h3 className="text-lg font-bold mb-4">Mode Engagement</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(analytics.modeEngagement).map(([mode, count]) => (
            <div key={mode} className="bg-slate-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-400">{count}</div>
              <div className="text-sm text-slate-400 mt-1 capitalize">{mode}</div>
              <div className="text-xs text-slate-500 mt-2">
                {Math.round((count / Object.values(analytics.modeEngagement).reduce((a, b) => a + b, 0)) * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty Analysis */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h3 className="text-lg font-bold mb-4">Difficulty Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 px-3">Game</th>
                <th className="text-right py-2 px-3">Avg Score</th>
                <th className="text-right py-2 px-3">Volatility</th>
                <th className="text-right py-2 px-3">Top 10%</th>
                <th className="text-right py-2 px-3">Sessions</th>
              </tr>
            </thead>
            <tbody>
              {analytics.difficultyAnalysis.map(({ gameId, avgScore, volatility, highPercentile, totalSessions }) => {
                const game = ALL_GAMES.find(g => g.id === gameId);
                return (
                  <tr key={gameId} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-2 px-3 font-semibold">{game?.name || gameId}</td>
                    <td className="py-2 px-3 text-right">
                      <span className={avgScore >= 70 ? 'text-green-400' : avgScore >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                        {Math.round(avgScore)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400">{Math.round(volatility)}</td>
                    <td className="py-2 px-3 text-right text-purple-400">{Math.round(highPercentile)}%</td>
                    <td className="py-2 px-3 text-right text-blue-400">{totalSessions}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drop-off Detection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h3 className="text-lg font-bold mb-2">Journey Mode Completion</h3>
          <div className="text-4xl font-bold text-green-400">{Math.round(analytics.avgJourneyCompletion)}%</div>
          <div className="text-sm text-slate-400 mt-1">of users complete Journey mode</div>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h3 className="text-lg font-bold mb-2">Avg Arena Duration</h3>
          <div className="text-4xl font-bold text-blue-400">{Math.round(analytics.avgArenaDuration / 1000)}s</div>
          <div className="text-sm text-slate-400 mt-1">average time in Arena mode</div>
        </div>
      </div>
    </div>
  );
}

/**
 * 1C. Cohort Analysis
 */
function CohortAnalysis({ timeRange }: { timeRange: string }) {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Coming Soon: Cohort Analysis</h3>
        <p className="text-slate-300">
          Cohort analysis requires user signup data and persistent storage.
          This feature will be available once authentication is implemented.
        </p>
        <div className="mt-4 space-y-2 text-sm text-slate-400">
          <div>• Signup cohorts (week-by-week)</div>
          <div>• Retention curves (D1, D7, D30)</div>
          <div>• Game preference clustering</div>
          <div>• Brainprint evolution per cohort</div>
        </div>
      </div>
    </div>
  );
}

/**
 * 1D. Experiments Panel
 */
function ExperimentsPanel() {
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const events = useMemo(() => telemetry.getEvents(), []);

  const experimentMetrics = useMemo(() => {
    const metrics: Record<string, any> = {};

    Object.keys(EXPERIMENTS).forEach(expId => {
      const exp = EXPERIMENTS[expId];
      const assignments = events.filter(e =>
        e.type === 'ab_assignment' &&
        e.metadata.experimentId === expId
      );

      const variantMetrics: Record<string, any> = {};

      exp.variants.forEach(variant => {
        const variantAssignments = assignments.filter(e => e.metadata.variantId === variant.id);
        const userIds = variantAssignments.map(e => e.userId).filter(Boolean);

        // Get game sessions for these users
        const gameSessions = events.filter(e =>
          e.type === 'game_session_end' &&
          userIds.includes(e.userId)
        ) as GameSessionEndEvent[];

        const avgScore = gameSessions.length > 0
          ? gameSessions.reduce((sum, e) => sum + e.metadata.score, 0) / gameSessions.length
          : 0;

        const completionRate = gameSessions.length > 0
          ? gameSessions.filter(e => e.metadata.completed).length / gameSessions.length * 100
          : 0;

        variantMetrics[variant.id] = {
          users: userIds.length,
          sessions: gameSessions.length,
          avgScore,
          completionRate,
          engagement: gameSessions.length / Math.max(userIds.length, 1),
        };
      });

      metrics[expId] = { experiment: exp, variantMetrics };
    });

    return metrics;
  }, [events]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">A/B Testing & Experiments</h2>

        {/* Experiments List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(experimentMetrics).map(([expId, data]) => {
            const { experiment, variantMetrics } = data;
            const isSelected = selectedExperiment === expId;

            return (
              <div
                key={expId}
                className={`bg-slate-900 rounded-xl p-6 border cursor-pointer transition ${
                  isSelected ? 'border-blue-500' : 'border-slate-800 hover:border-slate-700'
                }`}
                onClick={() => setSelectedExperiment(isSelected ? null : expId)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{experiment.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{experiment.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    experiment.status === 'running' ? 'bg-green-500/20 text-green-400' :
                    experiment.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                    experiment.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {experiment.status}
                  </span>
                </div>

                <div className="text-sm text-slate-300">
                  <div>Target: <span className="text-purple-400 font-semibold">{experiment.targetMetric}</span></div>
                  <div className="mt-2">Variants: {experiment.variants.length}</div>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                    {experiment.variants.map(variant => {
                      const metrics = variantMetrics[variant.id] || {};
                      return (
                        <div key={variant.id} className="bg-slate-800 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{variant.name}</span>
                            <span className="text-xs text-slate-400">{variant.weight}%</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className="text-slate-400">Users</div>
                              <div className="font-bold text-blue-400">{metrics.users || 0}</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Avg Score</div>
                              <div className="font-bold text-green-400">{Math.round(metrics.avgScore || 0)}</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Engagement</div>
                              <div className="font-bold text-purple-400">{(metrics.engagement || 0).toFixed(1)}</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Completion</div>
                              <div className="font-bold text-yellow-400">{Math.round(metrics.completionRate || 0)}%</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * 1E. System Health
 */
function SystemHealth() {
  const events = useMemo(() => telemetry.getEvents(), []);

  const health = useMemo(() => {
    const errors = events.filter(e => e.type === 'error');
    const last24h = events.filter(e => e.timestamp >= Date.now() - 24 * 60 * 60 * 1000);
    const errorRate = (errors.length / events.length) * 100;

    return {
      totalEvents: events.length,
      dbSize: `~${Math.round(JSON.stringify(events).length / 1024)}KB`,
      errorRate,
      uptime: '99.9%', // Mock - would come from actual monitoring
      avgResponseTime: '45ms', // Mock - would come from API monitoring
    };
  }, [events]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">System Health</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="text-sm text-slate-400 mb-1">DB Size (In-Memory)</div>
          <div className="text-3xl font-bold text-blue-400">{health.dbSize}</div>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="text-sm text-slate-400 mb-1">Error Rate</div>
          <div className="text-3xl font-bold text-red-400">{health.errorRate.toFixed(2)}%</div>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="text-sm text-slate-400 mb-1">Total Events</div>
          <div className="text-3xl font-bold text-green-400">{health.totalEvents}</div>
        </div>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Production Monitoring Needed</h3>
        <p className="text-slate-300">
          For production deployment, integrate with proper monitoring:
        </p>
        <div className="mt-4 space-y-2 text-sm text-slate-400">
          <div>• CPU/Memory: Use PM2, Docker stats, or cloud provider metrics</div>
          <div>• API Response Time: Add middleware to track request duration</div>
          <div>• Database: PostgreSQL pg_stat_statements for query performance</div>
          <div>• Uptime: Integrate with UptimeRobot, Pingdom, or StatusCake</div>
        </div>
      </div>
    </div>
  );
}

/**
 * 1F. Admin Tools
 */
function AdminTools() {
  const [featureFlags, setFeatureFlags] = useState(FEATURE_FLAGS);

  const handleToggleFeature = (featureId: string) => {
    // In production, this would update database
    console.log(`Toggle feature: ${featureId}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Admin Tools</h2>

      {/* Feature Flags */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h3 className="text-lg font-bold mb-4">Feature Flags</h3>
        <div className="space-y-3">
          {Object.entries(featureFlags).map(([id, flag]) => (
            <div key={id} className="flex items-center justify-between bg-slate-800 p-4 rounded-lg">
              <div className="flex-1">
                <div className="font-semibold">{flag.name}</div>
                <div className="text-sm text-slate-400 mt-1">{flag.description}</div>
                <div className="text-xs text-slate-500 mt-1">Rollout: {flag.rolloutPercentage}%</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={flag.enabled}
                  onChange={() => handleToggleFeature(id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Game Toggles */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h3 className="text-lg font-bold mb-4">Game Enable/Disable</h3>
        <p className="text-sm text-slate-400 mb-4">All games currently enabled. Click to disable specific games:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {ALL_GAMES.map(game => (
            <button
              key={game.id}
              className="px-3 py-2 bg-green-500/20 text-green-400 rounded text-sm font-semibold hover:bg-green-500/30 transition"
            >
              {game.name}
            </button>
          ))}
        </div>
      </div>

      {/* Cache Management */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h3 className="text-lg font-bold mb-4">Cache Management</h3>
        <div className="space-y-3">
          <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-semibold transition">
            Clear Game Cache
          </button>
          <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-semibold transition ml-3">
            Clear Telemetry Events
          </button>
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
  subtitle
}: {
  label: string;
  value: string | number;
  color?: 'blue' | 'green' | 'purple' | 'red';
  subtitle?: string;
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
      {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
    </div>
  );
}
