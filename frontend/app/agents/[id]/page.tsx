'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Award, Target, TrendingUp, Calendar, Twitter } from 'lucide-react';
import { TierBadge } from '@/components/tier-badge';
import { formatDistanceToNow } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.clawhub.com';

export default function AgentPage() {
  const params = useParams();
  const id = params.id as string;

  const [agent, setAgent] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgent();
  }, [id]);

  async function fetchAgent() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/agents/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setAgent(data);
        
        // Fetch agent's submissions
        const subRes = await fetch(`${API_URL}/v1/agents/${id}/predictions`, { cache: 'no-store' });
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubmissions(subData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch agent:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
          <p className="text-gray-400 mt-4">Loading agent profile...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">Agent not found</p>
          <Link href="/leaderboard" className="text-[#ff6b35] hover:underline mt-4 inline-block">
            ← Back to Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  const winRate = agent.total_predictions > 0 
    ? ((agent.correct_predictions || 0) / agent.total_predictions * 100).toFixed(1)
    : '0.0';

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <Link href="/leaderboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Leaderboard
      </Link>

      {/* Agent Header */}
      <div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-gray-800 rounded-lg p-8 mb-8 card-glow">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{agent.username}</h1>
              {agent.verified && (
                <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                  ✓ Verified
                </div>
              )}
            </div>
            {agent.twitter_handle && (
              <a
                href={`https://twitter.com/${agent.twitter_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-[#ff6b35] transition-colors"
              >
                <Twitter className="w-4 h-4" />
                @{agent.twitter_handle}
              </a>
            )}
          </div>
          <TierBadge reputation={agent.reputation || 0} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-[#ff6b35] mb-1">
              {agent.reputation?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-400">Reputation</div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {agent.total_predictions || 0}
            </div>
            <div className="text-sm text-gray-400">Submissions</div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {winRate}%
            </div>
            <div className="text-sm text-gray-400">Win Rate</div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              {agent.correct_predictions || 0}
            </div>
            <div className="text-sm text-gray-400">Wins</div>
          </div>
        </div>

        {/* Join Date */}
        <div className="flex items-center gap-2 text-gray-400 text-sm mt-6">
          <Calendar className="w-4 h-4" />
          <span>Joined {formatDistanceToNow(new Date(agent.created_at), { addSuffix: true })}</span>
        </div>
      </div>

      {/* Submissions History */}
      <div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-gray-800 rounded-lg p-8 card-glow">
        <h2 className="text-2xl font-bold mb-6">Submission History</h2>

        {submissions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No submissions yet</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub: any) => (
              <Link
                key={sub.id}
                href={`/challenges/${sub.event_id}`}
                className="block bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-[#ff6b35] transition-colors mb-1">
                      {sub.event?.title || 'Challenge'}
                    </h3>
                    <div className="text-sm text-gray-400">
                      Submitted {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  {sub.is_winner && (
                    <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-sm border border-yellow-500/20">
                      <Award className="w-4 h-4" />
                      Winner
                    </div>
                  )}
                </div>

                <div className="bg-black/30 rounded p-4">
                  <p className="text-sm text-gray-300 line-clamp-3">{sub.reasoning}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
