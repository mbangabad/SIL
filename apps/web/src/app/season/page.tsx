'use client';

/**
 * Season Page
 *
 * Displays active season info, user progress, milestones, and seasonal leaderboard
 */

import { useEffect, useState } from 'react';
import { ScoreBar } from '@sil/ui';

interface Season {
  id: string;
  seasonNumber: number;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  config: {
    games?: string[];
    milestones?: Milestone[];
    tierThresholds?: {
      bronze: number;
      silver: number;
      gold: number;
      platinum: number;
      diamond: number;
    };
  };
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  requirement: number;
  reward?: string;
}

interface UserProgress {
  totalScore: number;
  gamesPlayed: number;
  rank: number | null;
  tier: string;
  milestonesCompleted: string[];
  badgesEarned: string[];
}

export default function SeasonPage() {
  const [season, setSeason] = useState<Season | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock user ID (in real app, get from auth)
  const currentUserId = 'user1';

  useEffect(() => {
    async function fetchSeasonData() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        // Fetch active season
        const seasonRes = await fetch(`${baseUrl}/api/seasons/active`);
        const seasonData = await seasonRes.json();

        if (seasonData.success) {
          setSeason(seasonData.season);

          // Fetch user progress
          const progressRes = await fetch(
            `${baseUrl}/api/seasons/${seasonData.season.id}/progress/${currentUserId}`
          );
          const progressData = await progressRes.json();

          if (progressData.success) {
            setProgress(progressData.progress);
          }

          // Fetch season leaderboard
          const leaderboardRes = await fetch(
            `${baseUrl}/api/seasons/${seasonData.season.id}/leaderboard?userId=${currentUserId}&limit=10`
          );
          const leaderboardData = await leaderboardRes.json();

          if (leaderboardData.success) {
            setLeaderboard(leaderboardData.leaderboard);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch season data:', error);
        setLoading(false);
      }
    }

    fetchSeasonData();
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-xl">Loading season...</div>
      </div>
    );
  }

  if (!season) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-xl">No active season</div>
      </div>
    );
  }

  const daysRemaining = Math.ceil(
    (new Date(season.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-blue-300 mb-2">Season {season.seasonNumber}</div>
              <h1 className="text-5xl font-bold mb-3">{season.name}</h1>
              <p className="text-xl text-slate-300 mb-4">{season.description}</p>
              <div className="flex gap-4 text-sm">
                <div className="bg-white/10 px-4 py-2 rounded-lg">
                  <span className="text-slate-300">Started:</span>{' '}
                  <span className="font-bold">
                    {new Date(season.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-lg">
                  <span className="text-slate-300">Ends:</span>{' '}
                  <span className="font-bold">
                    {new Date(season.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-lg">
                  <span className="font-bold text-yellow-300">
                    {daysRemaining} days remaining
                  </span>
                </div>
              </div>
            </div>

            {progress && (
              <div className="bg-white/10 rounded-lg p-6 min-w-[200px]">
                <div className="text-sm text-slate-300 mb-2">Your Rank</div>
                <div className="text-4xl font-bold mb-1">
                  #{progress.rank || '-'}
                </div>
                <div className="text-sm capitalize">
                  <span
                    className={`inline-block px-2 py-1 rounded ${
                      progress.tier === 'diamond'
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : progress.tier === 'platinum'
                        ? 'bg-purple-500/20 text-purple-300'
                        : progress.tier === 'gold'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : progress.tier === 'silver'
                        ? 'bg-slate-300/20 text-slate-300'
                        : 'bg-orange-600/20 text-orange-300'
                    }`}
                  >
                    {progress.tier} Tier
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Progress & Milestones */}
          <div className="lg:col-span-2 space-y-6">
            {/* Your Progress */}
            {progress && (
              <div className="bg-slate-800/50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-slate-400">Total Score</div>
                    <div className="text-3xl font-bold">{progress.totalScore}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Games Played</div>
                    <div className="text-3xl font-bold">{progress.gamesPlayed}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Badges Earned</div>
                    <div className="text-3xl font-bold">{progress.badgesEarned.length}</div>
                  </div>
                </div>

                {/* Tier Progress */}
                {season.config.tierThresholds && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tier Progress</span>
                      <span className="text-slate-400">
                        {progress.totalScore} / Next Tier
                      </span>
                    </div>
                    <ScoreBar
                      current={75}
                      max={100}
                      label=""
                      showPercentage={false}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Milestones */}
            {season.config.milestones && season.config.milestones.length > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Milestones</h2>
                <div className="space-y-4">
                  {season.config.milestones.map((milestone) => {
                    const isCompleted = progress?.milestonesCompleted.includes(
                      milestone.id
                    );
                    const progressPercent = Math.min(
                      100,
                      ((progress?.gamesPlayed || 0) / milestone.requirement) * 100
                    );

                    return (
                      <div
                        key={milestone.id}
                        className={`border rounded-lg p-4 ${
                          isCompleted
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold">{milestone.name}</h3>
                            <p className="text-sm text-slate-400">
                              {milestone.description}
                            </p>
                          </div>
                          {isCompleted && (
                            <div className="text-green-400 text-2xl">✓</div>
                          )}
                        </div>
                        {!isCompleted && (
                          <div className="mt-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-400">
                                {progress?.gamesPlayed || 0} / {milestone.requirement}
                              </span>
                              <span className="text-slate-400">
                                {Math.round(progressPercent)}%
                              </span>
                            </div>
                            <ScoreBar
                              current={progressPercent}
                              max={100}
                              label=""
                              showPercentage={false}
                            />
                          </div>
                        )}
                        {milestone.reward && (
                          <div className="mt-2 text-sm text-yellow-400">
                            🎁 Reward: {milestone.reward}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Featured Games */}
            {season.config.games && season.config.games.length > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Featured Games</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {season.config.games.map((game) => (
                    <div
                      key={game}
                      className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer"
                    >
                      <div className="text-xl font-bold">{game}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Leaderboard */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Season Leaderboard</h2>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => {
                  const isCurrentUser = entry.userId === currentUserId;
                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        isCurrentUser
                          ? 'bg-blue-500/20 border border-blue-500'
                          : 'bg-slate-900/50'
                      }`}
                    >
                      <div
                        className={`text-2xl font-bold w-8 text-center ${
                          entry.rank === 1
                            ? 'text-yellow-400'
                            : entry.rank === 2
                            ? 'text-slate-300'
                            : entry.rank === 3
                            ? 'text-orange-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {entry.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate">
                          {entry.displayName || entry.username}
                        </div>
                        <div className="text-sm text-slate-400">
                          {entry.gamesPlayed} games
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{entry.totalScore}</div>
                        <div
                          className={`text-xs px-2 py-1 rounded capitalize ${
                            entry.tier === 'diamond'
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : entry.tier === 'platinum'
                              ? 'bg-purple-500/20 text-purple-300'
                              : entry.tier === 'gold'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : entry.tier === 'silver'
                              ? 'bg-slate-300/20 text-slate-300'
                              : 'bg-orange-600/20 text-orange-300'
                          }`}
                        >
                          {entry.tier}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
