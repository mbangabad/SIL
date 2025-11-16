/**
 * "Today" Screen
 * Daily recommendations, goals, streak, and brainprint pulse
 */

'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { telemetry } from '@sil/core';
import {type GameSessionEndEvent } from '@sil/core';
import { ALL_GAMES } from '@sil/games';
import { getRecommendedGames, type PlayerProgress, initializeProgress } from '@sil/core/progression';

export default function TodayPage() {
  // In production, load from database or localStorage
  // For now, use mock data
  const progress = useMemo(() => {
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('player_progress');
      if (stored) {
        return JSON.parse(stored) as PlayerProgress;
      }
    }
    return initializeProgress('user-today');
  }, []);

  const events = useMemo(() => telemetry.getEvents(), []);

  // Get today's game sessions
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = useMemo(() => {
    return events.filter(e =>
      e.type === 'game_session_end' &&
      new Date(e.timestamp).toISOString().split('T')[0] === today
    ) as GameSessionEndEvent[];
  }, [events, today]);

  // Calculate "what changed today" in brainprint
  const brainprintPulse = useMemo(() => {
    if (todaySessions.length === 0) return null;

    // Aggregate skill signals from today's games
    const skillAggregates: Record<string, { sum: number; count: number }> = {};

    todaySessions.forEach(session => {
      if (session.metadata.skillSignals) {
        Object.entries(session.metadata.skillSignals).forEach(([skill, value]) => {
          if (!skillAggregates[skill]) {
            skillAggregates[skill] = { sum: 0, count: 0 };
          }
          skillAggregates[skill].sum += value;
          skillAggregates[skill].count += 1;
        });
      }
    });

    const skills = Object.entries(skillAggregates).map(([skill, data]) => ({
      skill,
      avgValue: data.sum / data.count,
      change: '+' // Mock - would compare to yesterday
    })).slice(0, 5);

    return skills;
  }, [todaySessions]);

  // Get recommended games
  const playedGameIds = todaySessions.map(s => s.metadata.gameId);
  const recommendedIds = getRecommendedGames(ALL_GAMES, playedGameIds);
  const recommendedGames = recommendedIds.map(id => ALL_GAMES.find(g => g.id === id)).filter(Boolean);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Good {getTimeOfDay()}! 👋
          </h1>
          <p className="text-xl text-slate-300">
            {todaySessions.length > 0
              ? `You've played ${todaySessions.length} ${todaySessions.length === 1 ? 'game' : 'games'} today`
              : "Let's start your daily mind workout"}
          </p>
        </div>

        {/* Streak & Daily Goal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 text-9xl opacity-10">🔥</div>
            <div className="relative z-10">
              <div className="text-sm text-orange-300 uppercase font-semibold mb-2">Current Streak</div>
              <div className="text-6xl font-bold text-orange-400 mb-2">{progress.streak}</div>
              <div className="text-lg text-slate-300">
                {progress.streak === 0 && "Start your streak today!"}
                {progress.streak === 1 && "Great start! Keep it going!"}
                {progress.streak > 1 && progress.streak < 7 && `${7 - progress.streak} days to a week!`}
                {progress.streak >= 7 && "You're on fire! 🔥"}
              </div>
            </div>
          </div>

          {/* Daily Goal Card */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-8">
            <div className="text-sm text-blue-300 uppercase font-semibold mb-2">Daily Goal</div>
            <div className="text-2xl font-bold mb-4">
              {progress.dailyGoal.type === 'games-played' && `Play ${progress.dailyGoal.target} Games`}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>{progress.dailyGoal.current} / {progress.dailyGoal.target}</span>
                <span>{Math.round((progress.dailyGoal.current / progress.dailyGoal.target) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min((progress.dailyGoal.current / progress.dailyGoal.target) * 100, 100)}%` }}
                />
              </div>
            </div>

            {progress.dailyGoal.completed ? (
              <div className="text-green-400 font-semibold flex items-center gap-2">
                <span>✓</span>
                <span>Goal completed! +{progress.dailyGoal.xpReward} XP bonus</span>
              </div>
            ) : (
              <div className="text-slate-400">
                {progress.dailyGoal.target - progress.dailyGoal.current} more {progress.dailyGoal.target - progress.dailyGoal.current === 1 ? 'game' : 'games'} to go
              </div>
            )}
          </div>
        </div>

        {/* Recommended Games */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span>🎯</span>
            <span>Today's Recommended Games</span>
          </h2>
          <p className="text-slate-400 mb-6">
            Balanced mix of semantic, mathematical, and spatial challenges
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedGames.map((game, i) => {
              if (!game) return null;
              const categories = ['Semantic', 'Mathematical', 'Spatial'];
              const colors = ['from-purple-500 to-pink-500', 'from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500'];

              return (
                <Link
                  key={game.id}
                  href={`/play/${game.id}?mode=oneShot`}
                  className="group bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500 transition-all hover:scale-105"
                >
                  <div className="text-xs text-slate-500 uppercase font-semibold mb-2">{categories[i]}</div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 group-hover:bg-clip-text group-hover:text-transparent transition">
                    {game.name}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">{game.shortDescription}</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${colors[i]} text-white`}>
                    Play Now →
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Brainprint Pulse Update */}
        {brainprintPulse && brainprintPulse.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span>🧠</span>
              <span>Today's Brainprint Pulse</span>
            </h2>
            <p className="text-slate-300 mb-6">
              Cognitive dimensions activated in today's {todaySessions.length} {todaySessions.length === 1 ? 'session' : 'sessions'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {brainprintPulse.map(({ skill, avgValue }) => (
                <div key={skill} className="bg-slate-900/50 rounded-lg p-4 text-center">
                  <div className="text-xs text-slate-400 uppercase mb-2">{skill.replace('_', ' ')}</div>
                  <div className="text-3xl font-bold text-indigo-400">{Math.round(avgValue)}</div>
                  <div className="text-xs text-green-400 mt-1">+active</div>
                </div>
              ))}
            </div>

            <Link
              href="/profile"
              className="inline-block mt-6 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition"
            >
              View Full Brainprint →
            </Link>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Level" value={progress.level} icon="⭐" />
          <StatCard label="Total XP" value={progress.xp} icon="💎" />
          <StatCard label="Games Today" value={todaySessions.length} icon="🎮" />
          <StatCard label="Badges" value={progress.badges.length} icon="🏆" />
        </div>
      </div>
    </main>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-blue-400">{value}</div>
      <div className="text-xs text-slate-400 uppercase mt-1">{label}</div>
    </div>
  );
}
