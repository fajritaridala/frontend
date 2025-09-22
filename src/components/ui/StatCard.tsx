import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      accent: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      accent: 'text-green-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      accent: 'text-yellow-600'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      accent: 'text-purple-600'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      accent: 'text-red-600'
    }
  };

  const colors = colorClasses[color];

  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {trend && (
            <div className="flex items-center">
              <span className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${colors.bg}`}>
          <span className={`text-3xl ${colors.icon}`}>{icon}</span>
        </div>
      </div>
    </Card>
  );
};