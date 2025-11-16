/**
 * Training Packs Page
 * Curated game collections for targeted cognitive training
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ALL_GAMES } from '@sil/games';

interface TrainingPack {
  id: string;
  name: string;
  icon: string;
  description: string;
  longDescription: string;
  color: string;
  games: string[]; // game IDs
  benefits: string[];
}

const TRAINING_PACKS: TrainingPack[] = [
  {
    id: 'creativity',
    name: 'Creativity Pack',
    icon: '🎨',
    description: 'Divergent thinking and creative problem solving',
    longDescription: 'Enhance your creative divergence with games that reward novel solutions, rare connections, and unconventional thinking patterns.',
    color: 'from-purple-500 to-pink-500',
    games: ['zero', 'splice', 'warpword', 'motif', 'divergence'],
    benefits: [
      'Boosts creative divergence',
      'Improves rare pattern detection',
      'Enhances conceptual blending',
    ],
  },
  {
    id: 'focus',
    name: 'Focus Pack',
    icon: '🎯',
    description: 'Attention control and executive function',
    longDescription: 'Sharpen your attention and filtering abilities with games that test sustained focus, rapid classification, and cognitive control.',
    color: 'from-blue-500 to-cyan-500',
    games: ['ping', 'flock', 'tensor', 'matchrate', 'choice'],
    benefits: [
      'Strengthens executive filtering',
      'Improves attention control',
      'Enhances decision speed',
    ],
  },
  {
    id: 'spatial',
    name: 'Spatial Pack',
    icon: '🧩',
    description: 'Spatial reasoning and visual-geometric thinking',
    longDescription: 'Develop spatial intelligence through games involving geometric patterns, transformations, and spatial optimization.',
    color: 'from-green-500 to-emerald-500',
    games: ['colorglyph', 'span2d', 'rotor', 'angle', 'flip'],
    benefits: [
      'Enhances spatial cognition',
      'Improves geometric reasoning',
      'Develops mental rotation skills',
    ],
  },
  {
    id: 'reasoning',
    name: 'Reasoning Pack',
    icon: '🧠',
    description: 'Logical deduction and pattern induction',
    longDescription: 'Master logical thinking with games that demand pattern recognition, sequence prediction, and inferential reasoning.',
    color: 'from-orange-500 to-red-500',
    games: ['next', 'gridlogic', 'shift', 'order', 'growth'],
    benefits: [
      'Strengthens logical induction',
      'Improves pattern recognition',
      'Enhances sequential reasoning',
    ],
  },
  {
    id: 'semantic',
    name: 'Semantic Pack',
    icon: '📚',
    description: 'Conceptual navigation and semantic understanding',
    longDescription: 'Explore semantic space through games that test your ability to navigate concepts, find connections, and understand meaning relationships.',
    color: 'from-indigo-500 to-purple-500',
    games: ['grip', 'span', 'cluster', 'merge', 'pivotword', 'radial'],
    benefits: [
      'Deepens semantic precision',
      'Improves conceptual navigation',
      'Enhances analogical reasoning',
    ],
  },
  {
    id: 'strategy',
    name: 'Strategy Pack',
    icon: '♟️',
    description: 'Planning, optimization, and strategic thinking',
    longDescription: 'Hone strategic decision-making with games involving optimization, risk assessment, and multi-step planning.',
    color: 'from-yellow-500 to-orange-500',
    games: ['optima', 'risk', 'balance', 'pack', 'harmony'],
    benefits: [
      'Improves strategic planning',
      'Enhances optimization skills',
      'Develops risk assessment',
    ],
  },
];

export default function TrainingPacksPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Training Packs
          </h1>
          <p className="text-2xl text-slate-300 max-w-3xl mx-auto">
            Curated game collections targeting specific cognitive dimensions.
            Choose a pack and play through games designed to strengthen specific mental skills.
          </p>
        </div>

        {/* Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {TRAINING_PACKS.map((pack) => (
            <TrainingPackCard key={pack.id} pack={pack} />
          ))}
        </div>

        {/* How It Works */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-6">How Training Packs Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div>
              <div className="text-5xl mb-4">1️⃣</div>
              <h3 className="text-xl font-bold mb-2">Choose a Pack</h3>
              <p className="text-slate-400">
                Select a training pack based on the cognitive skills you want to develop
              </p>
            </div>
            <div>
              <div className="text-5xl mb-4">2️⃣</div>
              <h3 className="text-xl font-bold mb-2">Play the Games</h3>
              <p className="text-slate-400">
                Work through 4-6 carefully selected games that target the same cognitive dimension
              </p>
            </div>
            <div>
              <div className="text-5xl mb-4">3️⃣</div>
              <h3 className="text-xl font-bold mb-2">Track Progress</h3>
              <p className="text-slate-400">
                Watch your brainprint evolve as you strengthen targeted cognitive dimensions
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function TrainingPackCard({ pack }: { pack: TrainingPack }) {
  const packGames = pack.games
    .map(id => ALL_GAMES.find(g => g.id === id))
    .filter(Boolean)
    .slice(0, 6); // Max 6 games per pack

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-blue-500 transition-all group">
      {/* Icon & Title */}
      <div className="mb-6">
        <div className="text-6xl mb-4">{pack.icon}</div>
        <h2 className="text-3xl font-bold mb-2 group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 group-hover:bg-clip-text group-hover:text-transparent transition">
          {pack.name}
        </h2>
        <p className="text-slate-400">{pack.description}</p>
      </div>

      {/* Long Description */}
      <p className="text-slate-300 mb-6 text-sm leading-relaxed">
        {pack.longDescription}
      </p>

      {/* Benefits */}
      <div className="mb-6">
        <div className="text-xs text-slate-500 uppercase font-semibold mb-3">Benefits</div>
        <div className="space-y-2">
          {pack.benefits.map((benefit, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Games */}
      <div className="mb-6">
        <div className="text-xs text-slate-500 uppercase font-semibold mb-3">
          {packGames.length} Games Included
        </div>
        <div className="flex flex-wrap gap-2">
          {packGames.map(game => game && (
            <span
              key={game.id}
              className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-medium"
            >
              {game.name}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Link
        href={packGames[0] ? `/play/${packGames[0].id}?mode=journey` : '/'}
        className={`block w-full text-center px-6 py-3 bg-gradient-to-r ${pack.color} text-white rounded-xl font-bold hover:scale-105 transition-transform`}
      >
        Start Pack →
      </Link>
    </div>
  );
}
