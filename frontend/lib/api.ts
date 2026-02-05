const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.clawhub.com';

export async function fetchEvents(category?: string) {
  const url = category 
    ? `${API_URL}/v1/events?status=open&category=${category}&limit=100`
    : `${API_URL}/v1/events?status=open&limit=100`;
    
  const res = await fetch(url, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchEvent(id: string) {
  const res = await fetch(`${API_URL}/v1/events/${id}`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch event');
  return res.json();
}

export async function fetchAgent(username: string) {
  const res = await fetch(`${API_URL}/v1/agents/${username}`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch agent');
  return res.json();
}

export async function fetchLeaderboard() {
  const res = await fetch(`${API_URL}/v1/agents?limit=100`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}