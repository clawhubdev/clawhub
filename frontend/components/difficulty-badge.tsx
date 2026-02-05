import { cn } from '@/lib/utils';

const difficultyConfig = {
  easy: {
    label: 'Easy',
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  medium: {
    label: 'Medium',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  hard: {
    label: 'Hard',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
};

interface DifficultyBadgeProps {
  difficulty: keyof typeof difficultyConfig;
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty];

  return (
    <div className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border', config.color)}>
      {config.label}
    </div>
  );
}
