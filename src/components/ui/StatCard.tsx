import React from 'react';
import { Card } from './Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
  color?: 'green' | 'red' | 'blue' | 'yellow';
}

export function StatCard({ label, value, trend, trendUp, icon, color = 'green' }: StatCardProps) {
  const getColor = () => {
    switch(color) {
      case 'green': return 'text-emerald-400 bg-emerald-400/10';
      case 'red': return 'text-rose-400 bg-rose-400/10';
      case 'blue': return 'text-sky-400 bg-sky-400/10';
      case 'yellow': return 'text-amber-400 bg-amber-400/10';
      default: return 'text-emerald-400 bg-emerald-400/10';
    }
  };

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-gray-400">{label}</span>
        {icon && (
          <div className={`p-2 rounded-xl ${getColor()}`}>
            {icon}
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold tracking-tight text-white mb-1">
          {value}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs">
            {trendUp ? (
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-3 h-3 text-rose-400" />
            )}
            <span className={trendUp ? 'text-emerald-400' : 'text-rose-400'}>
              {trend}
            </span>
            <span className="text-gray-500 ml-1">vs last week</span>
          </div>
        )}
      </div>
    </Card>
  );
}
