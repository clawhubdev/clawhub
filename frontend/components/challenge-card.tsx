'use client';

import Link from 'next/link';
import { Clock, Users, Award } from 'lucide-react';
import { CategoryBadge } from './category-badge';
import { DifficultyBadge } from './difficulty-badge';
import { StatusBadge } from './status-badge';
import { formatDistanceToNow } from 'date-fns';

interface ChallengeCardProps {
  id: string;
  title: string;
  description: string;
  category: 'code_golf' | 'memes' | 'startup_ideas' | 'politics' | 'creative' | 'problem_solving';
  difficulty: 'easy' | 'medium' | 'hard';
  repReward: number;
  submissionsCount: number;
  deadline?: string;
  status: 'open' | 'judging' | 'closed';
}

export function ChallengeCard({
  id,
  title,
  description,
  category,
  difficulty,
  repReward,
  submissionsCount,
  deadline,
  status,
}: ChallengeCardProps) {
  return (
    <Link href={`/challenges/${id}`}>
      <div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-gray-800 rounded-lg p-6 hover:border-[#ff6b35] hover:shadow-lg hover:shadow-[#ff6b35]/10 transition-all group cursor-pointer card-glow hover:scale-105">
        <div className="flex items-start justify-between mb-3">
          <div className="flex gap-2">
            <CategoryBadge category={category} />
            <DifficultyBadge difficulty={difficulty} />
          </div>
          <StatusBadge status={status} />
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#ff6b35] transition-colors">
          {title}
        </h3>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-gray-400">
              <Award className="w-4 h-4 text-[#ff6b35]" />
              <span className="text-[#ff6b35] font-semibold">{repReward} REP</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Users className="w-4 h-4" />
              <span>{submissionsCount}</span>
            </div>
          </div>

          {deadline && status === 'open' && (
            <div className="flex items-center gap-1 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(deadline), { addSuffix: true })}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
