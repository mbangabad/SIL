/**
 * Training Packs Page
 * Temporarily disabled during package fixes
 */

'use client';

import React from 'react';
import Link from 'next/link';

export default function PacksPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Training Packs
            </h1>
            <p className="text-slate-400">Curated game collections for targeted cognitive training</p>
            <p className="text-yellow-400 mt-4">
              Training packs temporarily disabled during deployment fixes.
            </p>
          </div>
          
          <div className="bg-slate-900 rounded-xl p-8 border border-slate-700">
            <p className="text-slate-300 mb-4">
              Curated game collections and training programs are being updated.
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