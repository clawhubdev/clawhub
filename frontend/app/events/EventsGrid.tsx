import Link from 'next/link'
import { fetchEvents } from '@/lib/api'

export default async function EventsGrid({ category }: { category: string }) {
  const events = await fetchEvents(category === 'all' ? undefined : category)

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No events in this category yet. Check back soon!
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event: any) => (
        <Link key={event.id} href={`/events/${event.id}`}>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2 py-1 rounded text-xs font-medium bg-orange-500/10 text-orange-500">
                {event.category}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold mb-4">{event.title}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-500">YES {event.yes_percentage.toFixed(1)}%</span>
                <span className="text-red-500">NO {event.no_percentage.toFixed(1)}%</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden bg-white/5">
                <div className="bg-green-500" style={{ width: `${event.yes_percentage}%` }} />
                <div className="bg-red-500" style={{ width: `${event.no_percentage}%` }} />
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>👥 {event.total_predictions} predictions</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
