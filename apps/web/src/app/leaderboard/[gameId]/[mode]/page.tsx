'use client';

/**
 * Leaderboard Page
 *
 * Displays global, daily, and friends leaderboards for a specific game/mode
 */

import { useEffect, useState } from 'react';
import { LeaderboardTable } from '@sil/ui';

interface LeaderboardEntry {
  userId: string;
  username: string | null;
  displayName: string | null;
  score: number;
  rank: number;
  percentile: number;
  gamesPlayed?: number;
  tier?: string;
}

type LeaderboardType = 'global' | 'daily' | 'friends';

export default function LeaderboardPage({
  params,
}: {
  params: { gameId: string; mode: string };
}) {
  const { gameId, mode } = params;
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  // Mock user ID (in real app, get from auth)
  const currentUserId = 'user1';

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);

        let url = '';
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        if (leaderboardType === 'global') {
          url = `${baseUrl}/api/leaderboards/${gameId}/${mode}/global?userId=${currentUserId}`;
        } else if (leaderboardType === 'daily') {
          const today = new Date().toISOString().split('T')[0];
          url = `${baseUrl}/api/leaderboards/${gameId}/${mode}/daily/${today}?userId=${currentUserId}`;
        } else if (leaderboardType === 'friends') {
          url = `${baseUrl}/api/leaderboards/${gameId}/${mode}/friends/${currentUserId}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          setEntries(data.leaderboard);
          setUserPosition(data.userPosition);
        }

        // Fetch stats
        const statsRes = await fetch(
          `${baseUrl}/api/leaderboards/${gameId}/${mode}/stats`
        );
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [gameId, mode, leaderboardType, currentUserId]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold mb-2">
            {gameId} Leaderboard
          </h1>
          <p className="text-slate-400 text-lg capitalize">{mode} Mode</p>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-sm text-slate-400">Total Players</div>
                <div className="text-2xl font-bold mt-1">
                  {stats.totalPlayers.toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-sm text-slate-400">Average Score</div>
                <div className="text-2xl font-bold mt-1">{stats.averageScore}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-sm text-slate-400">Median Score</div>
                <div className="text-2xl font-bold mt-1">{stats.medianScore}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-sm text-slate-400">Top Score</div>
                <div className="text-2xl font-bold mt-1 text-yellow-400">
                  {stats.topScore}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-sm text-slate-400">Your Rank</div>
                <div className="text-2xl font-bold mt-1 text-blue-400">
                  {userPosition?.userEntry?.rank || '-'}
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Type Selector */}
          <div className="flex gap-4 mt-8 border-b border-slate-800">
            <button
              onClick={() => setLeaderboardType('global')}
              className={`px-4 py-2 font-medium transition-colors ${
                leaderboardType === 'global'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Global
            </button>
            <button
              onClick={() => setLeaderboardType('daily')}
              className={`px-4 py-2 font-medium transition-colors ${
                leaderboardType === 'daily'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setLeaderboardType('friends')}
              className={`px-4 py-2 font-medium transition-colors ${
                leaderboardType === 'friends'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Friends
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12 text-slate-400">
            Loading leaderboard...
          </div>
        ) : (
          <>
            {/* User Position Highlight */}
            {userPosition?.userEntry && (
              <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-3">Your Position</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-slate-400">Rank</div>
                    <div className="text-2xl font-bold">
                      #{userPosition.userEntry.rank}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Score</div>
                    <div className="text-2xl font-bold">
                      {userPosition.userEntry.score}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Percentile</div>
                    <div className="text-2xl font-bold">
                      {userPosition.userEntry.percentile}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Tier</div>
                    <div className="text-2xl font-bold capitalize">
                      {userPosition.userEntry.tier || 'Bronze'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Table */}
            <div className="bg-slate-800/50 rounded-lg overflow-hidden">
              <LeaderboardTable
                entries={entries}
                currentUserId={currentUserId}
                showGamesPlayed={leaderboardType === 'global'}
              />
            </div>

            {/* Tier Distribution */}
            {stats?.tierDistribution && leaderboardType === 'global' && (
              <div className="mt-8 bg-slate-800/50 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Tier Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(stats.tierDistribution).map(
                    ([tier, count]: [string, any]) => {
                      const percentage = (count / stats.totalPlayers) * 100;
                      return (
                        <div key={tier}>
                          <div className="flex justify-between mb-1">
                            <span className="capitalize font-medium">{tier}</span>
                            <span className="text-slate-400">
                              {count} players ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                tier === 'diamond'
                                  ? 'bg-cyan-400'
                                  : tier === 'platinum'
                                  ? 'bg-purple-400'
                                  : tier === 'gold'
                                  ? 'bg-yellow-400'
                                  : tier === 'silver'
                                  ? 'bg-slate-300'
                                  : 'bg-orange-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
