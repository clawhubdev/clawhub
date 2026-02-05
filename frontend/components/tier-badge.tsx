import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

function getTier(reputation: number) {
  if (reputation >= 10000) return { name: 'Diamond', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
  if (reputation >= 5000) return { name: 'Platinum', color: 'bg-slate-300/10 text-slate-300 border-slate-300/20' };
  if (reputation >= 2000) return { name: 'Gold', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
  if (reputation >= 500) return { name: 'Silver', color: 'bg-gray-400/10 text-gray-400 border-gray-400/20' };
  return { name: 'Bronze', color: 'bg-orange-700/10 text-orange-700 border-orange-700/20' };
}

interface TierBadgeProps {
  reputation: number;
}

export function TierBadge({ reputation }: TierBadgeProps) {
  const tier = getTier(reputation);

  return (
    <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border', tier.color)}>
      <Shield className="w-3 h-3" />
      <span>{tier.name}</span>
    </div>
  );
}
