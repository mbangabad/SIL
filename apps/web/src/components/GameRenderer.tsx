/**
 * GameRenderer Component
 * Temporarily disabled during package fixes
 */

'use client';

import React from 'react';

interface GameRendererProps {
  game?: any;
  gameData?: any;
  onAction?: (action: any) => void;
}

export function GameRenderer({ game, gameData, onAction }: GameRendererProps) {
  return (
    <div className="bg-slate-900 rounded-xl p-8 border border-slate-700">
      <h3 className="text-xl font-bold mb-4">Game Renderer</h3>
      <p className="text-slate-300 mb-4">
        Game functionality temporarily disabled during deployment fixes.
      </p>
      <p className="text-slate-400 text-sm">
        UI component packages need to be fixed to support browser environment.
      </p>
    </div>
  );
}