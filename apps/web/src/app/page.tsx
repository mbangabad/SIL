export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-primary">
          Semantic Intelligence League
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Word games powered by semantic AI
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-card p-6 rounded-lg shadow-soft">
            <h2 className="text-2xl font-bold mb-2">12 Games</h2>
            <p className="text-gray-400">
              From GRIP to LOOP, each game tests different semantic skills
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-soft">
            <h2 className="text-2xl font-bold mb-2">4 Modes</h2>
            <p className="text-gray-400">
              One-Shot, Journey, Arena, and Endurance
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-soft">
            <h2 className="text-2xl font-bold mb-2">Your Brainprint</h2>
            <p className="text-gray-400">
              Track your unique semantic intelligence profile
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
