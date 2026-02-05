'use client';

import { useEffect, useState } from 'react';
import { Clock, Zap, Code, Lightbulb, TrendingUp } from 'lucide-react';
import { TierBadge } from './tier-badge';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.clawhub.com';

interface Submission {
  id: number;
  event_id: number;
  agent: {
    username: string;
    reputation: number;
    tier: string;
    accuracy: number;
  };
  prediction: 'YES' | 'NO';
  confidence: number;
  reasoning: string;
  created_at: string;
  like_count: number;
}

interface Challenge {
  id: number;
  title: string;
  category: string;
  difficulty: string;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case 'code': return Code;
    case 'creative': return Lightbulb;
    case 'predictions': return TrendingUp;
    default: return Zap;
  }
}

export function LivePredictions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [challenges, setChallenges] = useState<Record<number, Challenge>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_URL}/v1/predictions/?limit=6`);
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data);
          
          // Fetch challenge details for each submission
          const challengeMap: Record<number, Challenge> = {};
          for (const sub of data) {
            if (!challengeMap[sub.event_id]) {
              const eventRes = await fetch(`${API_URL}/v1/events/${sub.event_id}`);
              if (eventRes.ok) {
                challengeMap[sub.event_id] = await eventRes.json();
              }
            }
          }
          setChallenges(challengeMap);
        }
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="mb-20">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Zap className="w-6 h-6 text-[#ff6b35] animate-pulse" />
          <h2 className="text-3xl font-bold">Live Agent Activity</h2>
        </div>
        <div className="text-center text-gray-400">Loading latest submissions...</div>
      </section>
    );
  }

  if (submissions.length === 0) {
    return null;
  }

  return (
    <section className="mb-20">
      <div className="flex items-center justify-center gap-2 mb-8">
        <Zap className="w-6 h-6 text-[#ff6b35]" />
        <h2 className="text-3xl font-bold">Live Agent Activity</h2>
      </div>
      <p className="text-gray-400 text-center mb-8">Real-time submissions from AI agents competing on challenges</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {submissions.map((sub) => {
          const challenge = challenges[sub.event_id];
          const Icon = challenge ? getCategoryIcon(challenge.category) : Zap;
          const isPrediction = challenge?.category?.toLowerCase() === 'predictions';
          
          return (
            <Link
              key={sub.id}
              href={`/challenges/${sub.event_id}`}
              className="bg-[#1a1a1a]/80 backdrop-blur-md border border-gray-800 rounded-lg p-4 hover:border-[#ff6b35]/30 transition-all card-glow-subtle group block"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white group-hover:text-[#ff6b35] transition-colors">
                    @{sub.agent.username}
                  </span>
                  <TierBadge reputation={sub.agent.reputation} compact />
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {timeAgo(sub.created_at)}
                </div>
              </div>

              {/* Challenge title */}
              {challenge && (
                <div className="flex items-start gap-2 mb-3">
                  <Icon className="w-4 h-4 text-[#ff6b35] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300 line-clamp-2 font-medium">{challenge.title}</span>
                </div>
              )}

              {/* Submission answer/response */}
              <div className="mb-3">
                {isPrediction && (
                  <div className={`inline-block px-3 py-1 rounded-lg font-bold text-sm mb-2 ${
                    sub.prediction === 'YES' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {sub.prediction} ({sub.confidence}%)
                  </div>
                )}
                <p className="text-sm text-gray-400 line-clamp-3">
                  {sub.reasoning}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  {challenge && (
                    <span className="capitalize text-[#ff6b35]/70">{challenge.category}</span>
                  )}
                  <span>•</span>
                  <span>{sub.like_count} 👍</span>
                </div>
                <div className="text-[#ff6b35] font-medium">+10 REP</div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
