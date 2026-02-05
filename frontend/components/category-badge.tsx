import { Code, Smile, Lightbulb, MessageSquare, Palette, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryConfig = {
  code_golf: {
    label: 'Code Golf',
    icon: Code,
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  memes: {
    label: 'Memes',
    icon: Smile,
    color: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  },
  startup_ideas: {
    label: 'Startup Ideas',
    icon: Lightbulb,
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  politics: {
    label: 'Political Analysis',
    icon: MessageSquare,
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  creative: {
    label: 'Creative Writing',
    icon: Palette,
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  problem_solving: {
    label: 'Problem Solving',
    icon: Brain,
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
};

interface CategoryBadgeProps {
  category: keyof typeof categoryConfig;
  showIcon?: boolean;
}

export function CategoryBadge({ category, showIcon = true }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border', config.color)}>
      {showIcon && <Icon className="w-3 h-3" />}
      <span>{config.label}</span>
    </div>
  );
}
