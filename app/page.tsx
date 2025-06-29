import { Suspense } from 'react'
import Terminal from '@/components/Terminal'
import LoadingScreen from '@/components/LoadingScreen'
import WorldClock from '@/components/WorldClock'

export default function Home() {
  return (
    <main className="min-h-screen p-4 flex items-center justify-center">
      <Suspense fallback={<LoadingScreen />}>
        <Terminal />
        <WorldClock />
      </Suspense>
    </main>
  )
}