'use client'

export default function LoadingScreen() {
  return (
    <div className="w-full max-w-6xl mx-auto p-8 border border-green-400/50 terminal-border bg-black">
      <div className="space-y-2 text-center">
        <div className="text-2xl font-bold terminal-glow animate-pulse">
          NPC TOWN
        </div>
        <div className="text-sm opacity-70">
          INITIALIZING SIMULATION...
        </div>
        <div className="pt-4">
          <span className="animate-cursor-blink">_</span>
        </div>
      </div>
    </div>
  )
}