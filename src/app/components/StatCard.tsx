import { LucideIcon } from 'lucide-react';

/**
 * STATISTIC CARD COMPONENT
 * Reusable card for displaying dashboard statistics
 */
interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'purple' | 'green' | 'orange' | 'red';
  delay?: number;
}

const colorClasses = {
  purple: 'from-purple-500 to-purple-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600'
};

export function StatCard({ title, value, icon: Icon, color, delay = 0 }: StatCardProps) {
  return (
    <div
      className="group backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:bg-white/15 cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="text-right">
          <p className="text-white/70 text-sm font-medium mb-1">{title}</p>
          <p className="text-4xl font-bold text-white count-up">{value}</p>
        </div>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: '100%' }}
        ></div>
      </div>
    </div>
  );
}
