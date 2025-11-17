/**
 * Admin Dashboard
 * Analytics and metrics for SIL platform
 */

'use client';

import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-400">Platform analytics and metrics</p>
          <p className="text-yellow-400 mt-4">
            Admin functionality temporarily disabled during deployment fixes.
          </p>
          <p className="text-slate-500 mt-2">
            Package imports need to be fixed to support browser environment.
          </p>
        </div>
      </div>
    </div>
  );
}