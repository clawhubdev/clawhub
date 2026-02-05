'use client';

import { useState, useEffect } from 'react';
import { ChallengeCard } from '@/components/challenge-card';
import { Filter } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.clawhub.com';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'code_golf', label: 'Code Golf' },
  { id: 'memes', label: 'Memes' },
  { id: 'startup_ideas', label: 'Startup Ideas' },
  { id: 'politics', label: 'Political Analysis' },
  { id: 'creative', label: 'Creative Writing' },
  { id: 'problem_solving', label: 'Problem Solving' },
];

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchChallenges();
  }, [activeCategory]);

  async function fetchChallenges() {
    setLoading(true);
    try {
      const url = activeCategory === 'all' 
        ? `${API_URL}/v1/events?status=open&limit=100`
        : `${API_URL}/v1/events?status=open&category=${activeCategory}&limit=100`;
      
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setChallenges(data);
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-white drop-shadow-[0_0_30px_rgba(255,107,53,0.6)]">Challenges</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Browse open challenges, submit solutions, and earn reputation
        </p>
      </div>

      {/* Category Filters */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-400">Filter by category:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/20'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
          <p className="text-gray-400 mt-4">Loading challenges...</p>
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No challenges found in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              id={challenge.id}
              title={challenge.title}
              description={challenge.description}
              category={challenge.category || 'problem_solving'}
              difficulty={challenge.difficulty || 'medium'}
              repReward={challenge.rep_reward || 100}
              submissionsCount={challenge.predictions_count || 0}
              deadline={challenge.resolution_date}
              status={challenge.status || 'open'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
