/**
 * Game Selection Page
 *
 * Displays all available games and allows users to select one to play
 */

'use client';

import React from 'react';
import Link from 'next/link';

export default function PlayPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Play SIL Games
            </h1>
            <p className="text-xl text-slate-300 mb-4">
              50 cognitive micro-games testing semantic and spatial intelligence
            </p>
            <p className="text-yellow-400">
              Game functionality temporarily disabled during deployment fixes.
            </p>
          </div>

          <div className="bg-slate-900 rounded-xl p-8 border border-slate-700 text-center">
            <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
            <p className="text-slate-300 mb-6">
              We're updating our game engine to work properly in the browser environment.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}