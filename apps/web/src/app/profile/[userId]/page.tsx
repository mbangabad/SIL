'use client';

/**
 * User Profile Page
 *
 * Displays user stats, brainprint, game history, and leaderboard position
 */

import { useEffect, useState } from 'react';
import { BrainprintChart, LeaderboardTable, ScoreBar } from '@sil/ui';
import type { BrainprintData } from '@sil/ui';

interface UserProfile {
  id: string;
  username: string | null;
  displayName: string | null;
  tier: string;
  totalGamesPlayed: number;
  brainprint: BrainprintData;
}

interface BrainprintInsights {
  strengths: string[];
  growthAreas: string[];
  recommendedGames: string[];
}

interface GameSession {
  id: string;
  gameId: string;
  mode: string;
  score: number;
  percentile: number | null;
  completedAt: string;
}

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [insights, setInsights] = useState<BrainprintInsights | null>(null);
  const [history, setHistory] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'brainprint' | 'history'>('overview');

  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true);

        // Fetch user profile
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/profile/${userId}`);
        const profileData = await profileRes.json();

        if (profileData.success) {
          setProfile(profileData.user);
        }

        // Fetch brainprint insights
        const brainprintRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/profile/${userId}/brainprint`);
        const brainprintData = await brainprintRes.json();

        if (brainprintData.success) {
          setInsights(brainprintData.insights);
        }

        // Fetch game history
        const historyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/profile/${userId}/history?limit=10`);
        const historyData = await historyRes.json();

        if (historyData.success) {
          setHistory(historyData.sessions);
        }

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-xl">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {profile.displayName || profile.username || 'Anonymous'}
              </h1>
              {profile.username && (
                <p className="text-slate-400 text-lg">@{profile.username}</p>
              )}
            </div>
            <div className="text-right">
              <div className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-500 rounded-lg">
                <div className="text-sm text-slate-400">Tier</div>
                <div className="text-xl font-bold capitalize">{profile.tier}</div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-sm text-slate-400">Games Played</div>
              <div className="text-3xl font-bold mt-1">{profile.totalGamesPlayed}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-sm text-slate-400">Confidence</div>
              <div className="text-3xl font-bold mt-1">
                {profile.brainprint.confidenceScore || 0}%
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-sm text-slate-400">Rank</div>
              <div className="text-3xl font-bold mt-1">#156</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mt-8 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('brainprint')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'brainprint'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Brainprint
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Game History
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Brainprint Preview */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Cognitive Profile</h2>
              <BrainprintChart
                brainprint={profile.brainprint}
                mode="compact"
                topSkills={6}
              />
            </div>

            {/* Insights */}
            {insights && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-3 text-green-400">Your Strengths</h3>
                  <ul className="space-y-2">
                    {insights.strengths.map((skill) => (
                      <li key={skill} className="text-slate-300 capitalize">
                        • {skill}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-3 text-yellow-400">Growth Areas</h3>
                  <ul className="space-y-2">
                    {insights.growthAreas.map((skill) => (
                      <li key={skill} className="text-slate-300 capitalize">
                        • {skill}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-3 text-blue-400">Recommended Games</h3>
                  <ul className="space-y-2">
                    {insights.recommendedGames.map((game) => (
                      <li key={game} className="text-slate-300">
                        • {game}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Recent Games */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Recent Games</h2>
              <div className="space-y-3">
                {history.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold">{session.gameId}</div>
                      <div className="text-sm text-slate-400 capitalize">{session.mode}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{session.score}</div>
                      {session.percentile !== null && (
                        <div className="text-sm text-slate-400">
                          Top {100 - session.percentile}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Brainprint Tab */}
        {activeTab === 'brainprint' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Radar Chart</h2>
              <BrainprintChart
                brainprint={profile.brainprint}
                mode="radar"
                title="Cognitive Dimensions"
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Detailed Breakdown</h2>
              <BrainprintChart
                brainprint={profile.brainprint}
                mode="bars"
                title="All Skills"
              />
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Game History</h2>
            <div className="bg-slate-800/50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">
                      Game
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">
                      Mode
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-slate-400">
                      Score
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-slate-400">
                      Percentile
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-slate-400">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((session, index) => (
                    <tr
                      key={session.id}
                      className={index % 2 === 0 ? 'bg-slate-800/30' : ''}
                    >
                      <td className="px-6 py-4 font-medium">{session.gameId}</td>
                      <td className="px-6 py-4 text-slate-400 capitalize">
                        {session.mode}
                      </td>
                      <td className="px-6 py-4 text-right font-bold">{session.score}</td>
                      <td className="px-6 py-4 text-right text-slate-400">
                        {session.percentile !== null ? `${session.percentile}%` : '-'}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400">
                        {new Date(session.completedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
