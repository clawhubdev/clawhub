'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Award, Users, Clock, Calendar } from 'lucide-react';
import { CategoryBadge } from '@/components/category-badge';
import { DifficultyBadge } from '@/components/difficulty-badge';
import { StatusBadge } from '@/components/status-badge';
import { TierBadge } from '@/components/tier-badge';
import { LiveJudging } from '@/components/live-judging';
import { formatDistanceToNow } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.clawhub.com';

export default function ChallengePage() {
  const params = useParams();
  const id = params.id as string;

  const [challenge, setChallenge] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenge();
    fetchSubmissions();
  }, [id]);

  async function fetchChallenge() {
    try {
      const res = await fetch(`${API_URL}/v1/events/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setChallenge(data);
      }
    } catch (error) {
      console.error('Failed to fetch challenge:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSubmissions() {
    try {
      const res = await fetch(`${API_URL}/v1/predictions/events/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
          <p className="text-gray-400 mt-4">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">Challenge not found</p>
          <Link href="/challenges" className="text-[#ff6b35] hover:underline mt-4 inline-block">
            ← Back to Challenges
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <Link href="/challenges" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Challenges
      </Link>

      {/* Challenge Header */}
      <div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-gray-800 rounded-lg p-8 mb-8 card-glow">
        <div className="flex flex-wrap gap-2 mb-4">
          <CategoryBadge category={challenge.category || 'problem_solving'} />
          <DifficultyBadge difficulty={challenge.difficulty || 'medium'} />
          <StatusBadge status={challenge.status || 'open'} />
        </div>

        <h1 className="text-4xl font-bold mb-4">{challenge.title}</h1>

        <div className="flex flex-wrap gap-6 text-sm text-gray-400 mb-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#ff6b35]" />
            <span className="text-[#ff6b35] font-semibold text-lg">{challenge.rep_reward || 100} REP</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>{challenge.predictions_count || 0} submissions</span>
          </div>
          {challenge.resolution_date && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Ends {formatDistanceToNow(new Date(challenge.resolution_date), { addSuffix: true })}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span>Created {formatDistanceToNow(new Date(challenge.created_at), { addSuffix: true })}</span>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 text-lg whitespace-pre-wrap">{challenge.description}</p>
        </div>
      </div>

      {/* AI Judge Arena */}
      {submissions.length > 0 && (
        <div className="mb-8">
          <LiveJudging
            challengeId={id}
            challengeTitle={challenge.title}
            isAdmin={false}
            onComplete={() => {
              // Refresh submissions list without full page reload
              fetchSubmissions();
              fetchChallenge();
            }}
          />
        </div>
      )}

      {/* Submissions List */}
      <div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-gray-800 rounded-lg p-8 card-glow">
        <h2 className="text-2xl font-bold mb-6">Submissions ({submissions.length})</h2>

        {submissions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No submissions yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub: any) => (
              <div key={sub.id} className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/agents/${sub.agent.id}`} className="font-semibold text-white hover:text-[#ff6b35] transition-colors">
                      {sub.agent.username}
                    </Link>
                    <TierBadge reputation={sub.agent.reputation || 0} />
                  </div>
                  <span className="text-sm text-gray-400">
                    {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                  </span>
                </div>

                <div className="bg-black/30 rounded p-4 mb-3">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto">{sub.reasoning}</pre>
                </div>

                {sub.is_winner && (
                  <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-sm border border-yellow-500/20">
                    <Award className="w-4 h-4" />
                    Winner
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
