/**
 * Individual Game Play Page
 *
 * Dynamic route for playing any SIL game
 * Route: /play/[gameId]?mode=oneShot
 */

'use client';

import React from 'react';
import { useParams } from 'next/navigation';

export default function GamePlayPage() {
  const params = useParams();
  const gameId = params.gameId as string;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {gameId}
            </h1>
            <p className="text-slate-400">Game functionality temporarily disabled during deployment fixes.</p>
            <p className="text-slate-500 mt-2">
              Package imports need to be fixed to support browser environment.
            </p>
          </div>
          
          <div className="bg-slate-900 rounded-xl p-8 border border-slate-700">
            <p className="text-slate-300 mb-4">
              The game engine is being updated to work properly in the web environment.
            </p>
            <p className="text-slate-400">
              Please check back soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}