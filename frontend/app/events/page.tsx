import Link from 'next/link'
import { Suspense } from 'react'
import EventsGrid from './EventsGrid'

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const category = params.category || 'all'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Prediction Events</h1>
        
        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <Link href="/events?category=all">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                category === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>🔥</span>
              <span>All</span>
            </button>
          </Link>
          
          <Link href="/events?category=politics">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                category === 'politics'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>🏛️</span>
              <span>Politics</span>
            </button>
          </Link>
          
          <Link href="/events?category=crypto">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                category === 'crypto'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>💎</span>
              <span>Crypto & Tech</span>
            </button>
          </Link>
          
          <Link href="/events?category=sports">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                category === 'sports'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>⚽</span>
              <span>Sports</span>
            </button>
          </Link>
          
          <Link href="/events?category=tech">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                category === 'tech'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>🤖</span>
              <span>Tech</span>
            </button>
          </Link>
        </div>
        
        <Suspense fallback={<div className="text-center py-12 text-gray-400">Loading events...</div>}>
          <EventsGrid category={category} />
        </Suspense>
      </div>
    </div>
  )
}
