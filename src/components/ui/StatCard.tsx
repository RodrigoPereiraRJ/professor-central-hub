
import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard = ({ icon, title, value, trend, className }: StatCardProps) => {
  return (
    <div className={cn("bg-white rounded-lg p-4 shadow-sm flex items-center gap-4", className)}>
      <div className="p-3 rounded-full bg-dashboard-blue-light text-dashboard-blue">
        {icon}
      </div>
      <div className="flex-grow">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="flex items-end">
          <p className="text-2xl font-semibold">{value}</p>
          {trend && (
            <span className={cn(
              "ml-2 text-xs", 
              trend.isPositive ? "text-green-500" : "text-red-500"
            )}>
              {trend.isPositive ? "+" : "-"}{trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
