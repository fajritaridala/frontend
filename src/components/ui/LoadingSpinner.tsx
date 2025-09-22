import React from 'react';
import { Spinner } from '@heroui/react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'lg',
  text = 'Loading...',
  fullScreen = false
}) => {
  const containerClass = fullScreen 
    ? 'min-h-screen flex items-center justify-center'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <Spinner size={size} color="primary" />
        {text && <p className="text-gray-600 mt-4">{text}</p>}
      </div>
    </div>
  );
};