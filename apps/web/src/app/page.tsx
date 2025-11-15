import Link from 'next/link';

export default function Home() {
  const games = ['GRIP', 'ZERO', 'PING', 'SPAN', 'CLUSTER', 'COLORGLYPH', 'TRACE', 'FLOW', 'TENSOR', 'SPLICE', 'ONE', 'LOOP'];

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center max-w-5xl">
          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Semantic Intelligence League
          </h1>
          <p className="text-2xl text-slate-300 mb-12">
            Word games powered by semantic AI. Test your cognitive skills across 12 unique games.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Link
              href="/profile/user1"
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors text-lg"
            >
              View Profile
            </Link>
            <Link
              href="/season"
              className="px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors text-lg"
            >
              Current Season
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 p-8 rounded-xl shadow-lg border border-slate-700">
              <div className="text-5xl mb-4">🎮</div>
              <h2 className="text-3xl font-bold mb-3 text-white">12 Games</h2>
              <p className="text-slate-300 mb-4">
                From GRIP to LOOP, each game tests different semantic skills
              </p>
              <div className="text-sm text-slate-400">
                Theme matching • Rare words • Pattern recognition • And more...
              </div>
            </div>

            <div className="bg-slate-800/50 p-8 rounded-xl shadow-lg border border-slate-700">
              <div className="text-5xl mb-4">⚡</div>
              <h2 className="text-3xl font-bold mb-3 text-white">4 Modes</h2>
              <p className="text-slate-300 mb-4">
                One-Shot, Journey, Arena, and Endurance
              </p>
              <div className="text-sm text-slate-400">
                Single action • Multi-step • Timed competitive • Marathon challenges
              </div>
            </div>

            <div className="bg-slate-800/50 p-8 rounded-xl shadow-lg border border-slate-700">
              <div className="text-5xl mb-4">🧠</div>
              <h2 className="text-3xl font-bold mb-3 text-white">Your Brainprint</h2>
              <p className="text-slate-300 mb-4">
                Track your unique semantic intelligence profile
              </p>
              <div className="text-sm text-slate-400">
                22 cognitive dimensions • Personalized insights • Skill growth tracking
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Games Grid Section */}
      <div className="bg-slate-900 py-24 px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold mb-12 text-center text-white">
            All Games
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {games.map((game) => (
              <Link
                key={game}
                href={`/leaderboard/${game}/oneShot`}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 rounded-lg p-6 text-center transition-all cursor-pointer transform hover:scale-105"
              >
                <div className="text-2xl font-bold text-white">{game}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold mb-16 text-center text-white">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 text-blue-400">🏆 Leaderboards</h3>
              <p className="text-slate-300 mb-4">
                Compete globally, daily, or with friends. Track your rank and percentile across all games and modes.
              </p>
              <ul className="text-sm text-slate-400 space-y-2">
                <li>• Global all-time rankings</li>
                <li>• Daily competitive challenges</li>
                <li>• Friends-only leaderboards</li>
                <li>• 5-tier ranking system (Bronze to Diamond)</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 text-purple-400">🎯 Seasons</h3>
              <p className="text-slate-300 mb-4">
                Participate in themed seasons with unique milestones, badges, and rewards.
              </p>
              <ul className="text-sm text-slate-400 space-y-2">
                <li>• Seasonal leaderboards and rankings</li>
                <li>• Achievement milestones</li>
                <li>• Exclusive badges and rewards</li>
                <li>• Featured game rotations</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 text-green-400">📊 Brainprint Analytics</h3>
              <p className="text-slate-300 mb-4">
                Discover your cognitive strengths and areas for growth with detailed analytics.
              </p>
              <ul className="text-sm text-slate-400 space-y-2">
                <li>• 22 skill dimensions tracked</li>
                <li>• Personalized game recommendations</li>
                <li>• Radar and bar chart visualizations</li>
                <li>• Confidence score based on activity</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 text-yellow-400">🔬 Semantic Engine</h3>
              <p className="text-slate-300 mb-4">
                Powered by advanced NLP and vector embeddings for intelligent word analysis.
              </p>
              <ul className="text-sm text-slate-400 space-y-2">
                <li>• Cosine similarity scoring</li>
                <li>• Pattern-based rarity calculation</li>
                <li>• Semantic midpoint detection</li>
                <li>• Hot/cold cluster navigation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
