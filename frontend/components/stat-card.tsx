import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-gray-800 rounded-lg p-6 card-glow transition-all hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <div className="bg-[#ff6b35]/10 p-3 rounded-lg shadow-lg shadow-[#ff6b35]/20">
          <Icon className="w-6 h-6 text-[#ff6b35]" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
    </div>
  );
}
