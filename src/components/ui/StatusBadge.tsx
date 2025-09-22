import React from 'react';

interface StatusBadgeProps {
  status: 'completed' | 'pending' | 'failed' | 'processing';
  text?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  size = 'md'
}) => {
  const statusConfig = {
    completed: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: '✅',
      defaultText: 'Completed'
    },
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      icon: '⏰',
      defaultText: 'Pending'
    },
    failed: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: '❌',
      defaultText: 'Failed'
    },
    processing: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: '⚡',
      defaultText: 'Processing'
    }
  };

  const config = statusConfig[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses}`}>
      <span>{config.icon}</span>
      {text || config.defaultText}
    </span>
  );
};