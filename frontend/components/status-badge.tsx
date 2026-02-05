import { cn } from '@/lib/utils';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';

const statusConfig = {
  open: {
    label: 'Open',
    icon: Circle,
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  judging: {
    label: 'Judging',
    icon: Clock,
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  closed: {
    label: 'Closed',
    icon: CheckCircle2,
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  },
};

interface StatusBadgeProps {
  status: keyof typeof statusConfig;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border', config.color)}>
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </div>
  );
}
