/**
 * Science Page
 * Explains what SIL measures, what it's NOT, and the science behind it
 */

import React from 'react';
import Link from 'next/link';

export default function SciencePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            The Science
          </h1>
          <p className="text-2xl text-slate-300 max-w-2xl mx-auto">
            Understanding what we measure, how we measure it, and what it means
          </p>
        </div>

        {/* What We Measure */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-8 flex items-center gap-3">
            <span>🧠</span>
            <span>What We Measure</span>
          </h2>

          <div className="space-y-8">
            <MeasurementCard
              title="Semantic Intelligence"
              description="Your ability to understand, navigate, and manipulate conceptual relationships"
              examples={[
                'Finding semantic midpoints between concepts',
                'Detecting thematic clusters in word sets',
                'Navigating semantic gradients and analogies',
              ]}
              color="purple"
            />

            <MeasurementCard
              title="Pattern Induction"
              description="Recognition and extrapolation of logical and numerical patterns"
              examples={[
                'Identifying sequences and progressions',
                'Completing grid-based logical puzzles',
                'Predicting next elements in series',
              ]}
              color="blue"
            />

            <MeasurementCard
              title="Spatial Cognition"
              description="Mental manipulation and reasoning about spatial relationships"
              examples={[
                'Geometric transformations and symmetry',
                '2D/3D spatial optimization',
                'Distance and position judgments',
              ]}
              color="green"
            />

            <MeasurementCard
              title="Numeric Intuition"
              description="Quantitative reasoning and mathematical thinking"
              examples={[
                'Probability and risk assessment',
                'Optimization and balance problems',
                'Numeric pattern recognition',
              ]}
              color="cyan"
            />

            <MeasurementCard
              title="Strategic Reasoning"
              description="Planning, decision-making, and goal optimization"
              examples={[
                'Multi-step problem solving',
                'Trade-off analysis and choice optimization',
                'Resource allocation and distribution',
              ]}
              color="orange"
            />
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-8 flex items-center gap-3">
            <span>⚙️</span>
            <span>How It Works</span>
          </h2>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-3 text-blue-400">1. Skill Signal Generation</h3>
              <p className="text-slate-300">
                Every game emits "skill signals" - numerical indicators of performance across specific cognitive dimensions.
                For example, GRIP measures semantic precision, while OPTIMA measures optimization and strategic planning.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-3 text-purple-400">2. Brainprint Aggregation</h3>
              <p className="text-slate-300">
                Signals are aggregated across games to build your "Brainprint" - a 10-dimensional cognitive profile
                showing your relative strengths across semantic reasoning, pattern recognition, spatial thinking,
                and executive function.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-3 text-green-400">3. Normalization & Percentiles</h3>
              <p className="text-slate-300">
                Your scores are normalized and compared to the broader user population. A 90th percentile in
                "Analogical Reasoning" means you outperformed 90% of players in tasks requiring analogical transfer.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-3 text-orange-400">4. Evolution Tracking</h3>
              <p className="text-slate-300">
                We track changes in your brainprint over time. Are you improving in areas you practice?
                Do certain game combinations boost specific dimensions? The data reveals your cognitive trajectory.
              </p>
            </div>
          </div>
        </section>

        {/* Semantic Space Visualization */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-8 flex items-center gap-3">
            <span>🌐</span>
            <span>Semantic Space</span>
          </h2>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <p className="text-slate-300 mb-6">
              Many of our games operate in "semantic space" - a mathematical representation where words are positioned
              based on meaning. Words with similar meanings are closer together; unrelated words are farther apart.
            </p>

            <div className="bg-slate-800 rounded-xl p-8 mb-6">
              <svg viewBox="0 0 600 400" className="w-full h-auto">
                {/* Grid */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(51, 65, 85)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="600" height="400" fill="url(#grid)" />

                {/* Example word clusters */}
                {/* Animals cluster */}
                <circle cx="150" cy="100" r="40" fill="rgb(59, 130, 246)" fillOpacity="0.2" stroke="rgb(59, 130, 246)" strokeWidth="2" />
                <text x="150" y="80" textAnchor="middle" className="fill-blue-400 text-xs font-bold">dog</text>
                <text x="130" y="100" textAnchor="middle" className="fill-blue-400 text-xs">cat</text>
                <text x="170" y="100" textAnchor="middle" className="fill-blue-400 text-xs">wolf</text>
                <text x="150" y="120" textAnchor="middle" className="fill-blue-400 text-xs">puppy</text>

                {/* Colors cluster */}
                <circle cx="450" cy="100" r="40" fill="rgb(168, 85, 247)" fillOpacity="0.2" stroke="rgb(168, 85, 247)" strokeWidth="2" />
                <text x="450" y="80" textAnchor="middle" className="fill-purple-400 text-xs font-bold">red</text>
                <text x="430" y="100" textAnchor="middle" className="fill-purple-400 text-xs">blue</text>
                <text x="470" y="100" textAnchor="middle" className="fill-purple-400 text-xs">green</text>
                <text x="450" y="120" textAnchor="middle" className="fill-purple-400 text-xs">yellow</text>

                {/* Emotions cluster */}
                <circle cx="300" cy="300" r="50" fill="rgb(34, 197, 94)" fillOpacity="0.2" stroke="rgb(34, 197, 94)" strokeWidth="2" />
                <text x="300" y="275" textAnchor="middle" className="fill-green-400 text-xs font-bold">happy</text>
                <text x="270" y="295" textAnchor="middle" className="fill-green-400 text-xs">joy</text>
                <text x="330" y="295" textAnchor="middle" className="fill-green-400 text-xs">glad</text>
                <text x="300" y="315" textAnchor="middle" className="fill-green-400 text-xs">cheerful</text>
                <text x="300" y="330" textAnchor="middle" className="fill-green-400 text-xs">delighted</text>

                {/* Arrows showing relationships */}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="rgb(148, 163, 184)" />
                  </marker>
                </defs>

                <line x1="190" y1="100" x2="250" y2="280" stroke="rgb(148, 163, 184)" strokeWidth="1" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
                <text x="220" y="190" className="fill-slate-400 text-xs">semantic distance</text>
              </svg>
            </div>

            <p className="text-slate-300">
              Games like SPAN ask you to find the semantic midpoint between concepts. CLUSTER uses "hot/cold" feedback
              to guide you toward hidden themes. TRIBES tests your ability to group related concepts together.
            </p>
          </div>
        </section>

        {/* What This is NOT */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-8 flex items-center gap-3">
            <span>⚠️</span>
            <span>What This Is NOT</span>
          </h2>

          <div className="space-y-4">
            <NotCard
              title="Not an IQ Test"
              description="We don't measure general intelligence. We measure specific cognitive dimensions through targeted micro-assessments."
            />

            <NotCard
              title="Not Medical Diagnosis"
              description="SIL is a recreational platform for cognitive exploration. It is not intended to diagnose, treat, or assess medical conditions."
            />

            <NotCard
              title="Not Scientific Certification"
              description="While inspired by cognitive science research, your brainprint is a fun, informal profile - not a validated psychometric assessment."
            />

            <NotCard
              title="Not an Exam or Trivia Test"
              description="We don't test memorized knowledge or vocabulary. We test how you think, reason, and solve novel problems."
            />

            <NotCard
              title="Not 'Brain Training' Hype"
              description="We make no claims about improving real-world intelligence or preventing cognitive decline. We're a platform for cognitive play and self-discovery."
            />
          </div>
        </section>

        {/* Research Inspiration */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-8 flex items-center gap-3">
            <span>📚</span>
            <span>Research Inspiration</span>
          </h2>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <p className="text-slate-300 mb-6">
              SIL draws inspiration from decades of cognitive science research:
            </p>

            <div className="space-y-4 text-slate-300">
              <div className="flex gap-3">
                <span className="text-blue-400 font-bold">•</span>
                <div>
                  <strong>Semantic Memory Research</strong> - How concepts are organized and retrieved from memory
                  (Collins & Loftus, 1975; Tulving, 1972)
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-purple-400 font-bold">•</span>
                <div>
                  <strong>Word Embeddings & Vector Semantics</strong> - Mathematical models of meaning
                  (Mikolov et al., 2013; Pennington et al., 2014)
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-green-400 font-bold">•</span>
                <div>
                  <strong>Fluid Intelligence & Pattern Recognition</strong> - Abstract reasoning and novel problem solving
                  (Cattell, 1963; Raven, 1936)
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-orange-400 font-bold">•</span>
                <div>
                  <strong>Executive Function</strong> - Cognitive control, attention, and filtering
                  (Diamond, 2013; Miyake et al., 2000)
                </div>
              </div>
            </div>

            <p className="text-slate-400 text-sm mt-6">
              Note: SIL is an independent project. We are not affiliated with any academic institution,
              and our games are not validated research instruments.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/today"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform"
          >
            Start Your Cognitive Journey →
          </Link>
          <p className="text-slate-400 mt-4">
            Or <Link href="/profile" className="text-blue-400 hover:underline">view your brainprint</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function MeasurementCard({
  title,
  description,
  examples,
  color,
}: {
  title: string;
  description: string;
  examples: string[];
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    purple: 'from-purple-500/10 to-pink-500/10 border-purple-500/30',
    blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30',
    green: 'from-green-500/10 to-emerald-500/10 border-green-500/30',
    cyan: 'from-cyan-500/10 to-teal-500/10 border-cyan-500/30',
    orange: 'from-orange-500/10 to-red-500/10 border-orange-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6`}>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-slate-300 mb-4">{description}</p>
      <div className="space-y-2">
        <div className="text-sm text-slate-400 font-semibold">Example tasks:</div>
        {examples.map((example, i) => (
          <div key={i} className="flex gap-2 text-slate-300 text-sm">
            <span className="text-blue-400">•</span>
            <span>{example}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-red-900/10 border border-red-500/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-400 mb-2">❌ {title}</h3>
      <p className="text-slate-300">{description}</p>
    </div>
  );
}
