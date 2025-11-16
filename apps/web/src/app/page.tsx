import Link from 'next/link';
import { ALL_GAMES } from '@sil/games';
import { EmailCapture } from '@/components/EmailCapture';

export default function Home() {
  // Organize games by category
  const originalGames = ALL_GAMES.filter(g =>
    ['grip', 'zero', 'ping', 'span', 'cluster', 'colorglyph', 'trace', 'flow', 'tensor', 'splice', 'one', 'loop'].includes(g.id)
  );

  const semanticGames = ALL_GAMES.filter(g =>
    ['tribes', 'echochain', 'ghost', 'motif', 'flock', 'merge', 'pivotword', 'radial', 'traceword', 'shard', 'spoke', 'warpword', 'vector'].includes(g.id)
  );

  const mathLogicGames = ALL_GAMES.filter(g =>
    ['align', 'numgrip', 'span2d', 'gridlogic', 'shift', 'optima', 'next', 'rotor', 'midpoint', 'inverse', 'risk', 'angle', 'tilt', 'flip', 'matchrate', 'jump', 'balance', 'choice', 'spread', 'harmony', 'order', 'growth', 'pair', 'pack', 'fuse'].includes(g.id)
  );

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <div className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
        <div className="text-center max-w-5xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Semantic Intelligence League
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-12">
            Fast, beautiful micro-games testing semantic and spatial intelligence.
            <strong> 50 unique games</strong> across word, math, logic, and spatial domains.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/play"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-lg transition-all text-lg shadow-lg hover:shadow-xl"
              aria-label="Start playing games"
            >
              Play Now
            </Link>
            <Link
              href="/profile/user1"
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors text-lg"
              aria-label="View your profile"
            >
              View Profile
            </Link>
            <Link
              href="/season"
              className="px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors text-lg"
              aria-label="View current season"
            >
              Current Season
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 p-8 rounded-xl shadow-lg border border-slate-700">
              <div className="text-5xl mb-4" aria-hidden="true">🎮</div>
              <h2 className="text-3xl font-bold mb-3 text-white">50 Games</h2>
              <p className="text-slate-300 mb-4">
                12 original classics + 13 semantic word games + 25 math & logic games
              </p>
              <div className="text-sm text-slate-400">
                Theme matching • Semantic gradients • Spatial reasoning • Pattern logic • And more...
              </div>
            </div>

            <div className="bg-slate-800/50 p-8 rounded-xl shadow-lg border border-slate-700">
              <div className="text-5xl mb-4" aria-hidden="true">⚡</div>
              <h2 className="text-3xl font-bold mb-3 text-white">4 Modes</h2>
              <p className="text-slate-300 mb-4">
                One-Shot, Journey, Arena, and Endurance
              </p>
              <div className="text-sm text-slate-400">
                Single action • Multi-step • Timed competitive • Marathon challenges
              </div>
            </div>

            <div className="bg-slate-800/50 p-8 rounded-xl shadow-lg border border-slate-700">
              <div className="text-5xl mb-4" aria-hidden="true">🧠</div>
              <h2 className="text-3xl font-bold mb-3 text-white">Your Brainprint</h2>
              <p className="text-slate-300 mb-4">
                Track your unique cognitive profile across semantic and spatial domains
              </p>
              <div className="text-sm text-slate-400">
                22 cognitive dimensions • Personalized insights • Skill growth tracking
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Games Section */}
      <div className="bg-slate-900 py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-white">
            All 50 Games
          </h2>
          <p className="text-center text-slate-400 mb-12 max-w-3xl mx-auto">
            Three game families testing different aspects of intelligence: word semantics, mathematics & logic, and spatial reasoning.
          </p>

          {/* Original Classics */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-6 text-blue-400 flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">🎯</span>
              Original Classics ({originalGames.length} games)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {originalGames.map((game) => (
                <Link
                  key={game.id}
                  href={`/leaderboard/${game.id}/oneShot`}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 rounded-lg p-4 text-center transition-all cursor-pointer transform hover:scale-105"
                  aria-label={`Play ${game.name}`}
                >
                  <div className="text-xl font-bold text-white">{game.name}</div>
                  <div className="text-xs text-slate-400 mt-1 truncate">{game.shortDescription}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Semantic Word Games */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-6 text-purple-400 flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">💭</span>
              Semantic Word Games ({semanticGames.length} games)
            </h3>
            <p className="text-slate-400 mb-4 text-sm">
              Test semantic intuition, word relationships, and linguistic reasoning
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {semanticGames.map((game) => (
                <Link
                  key={game.id}
                  href={`/leaderboard/${game.id}/oneShot`}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-purple-500 rounded-lg p-4 text-center transition-all cursor-pointer transform hover:scale-105"
                  aria-label={`Play ${game.name}`}
                >
                  <div className="text-xl font-bold text-white">{game.name}</div>
                  <div className="text-xs text-slate-400 mt-1 truncate">{game.shortDescription}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Math & Logic Games */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-6 text-green-400 flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">🔢</span>
              Math, Logic & Spatial Games ({mathLogicGames.length} games)
            </h3>
            <p className="text-slate-400 mb-4 text-sm">
              Test numeric reasoning, pattern recognition, spatial intelligence, and strategic thinking
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mathLogicGames.map((game) => (
                <Link
                  key={game.id}
                  href={`/leaderboard/${game.id}/oneShot`}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-green-500 rounded-lg p-4 text-center transition-all cursor-pointer transform hover:scale-105"
                  aria-label={`Play ${game.name}`}
                >
                  <div className="text-xl font-bold text-white">{game.name}</div>
                  <div className="text-xs text-slate-400 mt-1 truncate">{game.shortDescription}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center text-white">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 text-blue-400">Leaderboards</h3>
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
              <h3 className="text-2xl font-bold mb-4 text-purple-400">Seasons</h3>
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
              <h3 className="text-2xl font-bold mb-4 text-green-400">Brainprint Analytics</h3>
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
              <h3 className="text-2xl font-bold mb-4 text-yellow-400">Semantic Engine</h3>
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

      {/* What Makes Us Different */}
      <div className="bg-slate-900 py-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
            Why Semantic Intelligence League?
          </h2>
          <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
            <p>
              <strong>No trivia. No spelling drills.</strong> SIL tests your cognitive abilities through semantic understanding,
              spatial reasoning, and pattern recognition.
            </p>
            <p>
              Our games measure <strong>how you think</strong>, not what you memorized. Each session generates a unique "Brainprint"
              revealing your cognitive profile across 22 dimensions.
            </p>
            <p>
              Daily 2-5 minute sessions. Modern, beautiful interface. Inspired by cognitive science research on semantic memory,
              spatial intelligence, and pattern recognition.
            </p>
          </div>
        </div>
      </div>

      {/* Email Capture */}
      <div className="py-24 px-6 md:px-12">
        <div className="max-w-2xl mx-auto">
          <EmailCapture />
        </div>
      </div>
    </main>
  );
}
