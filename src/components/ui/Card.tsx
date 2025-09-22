import React from 'react';
import { Card as HeroCard, CardBody, CardHeader } from '@heroui/react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  shadow = 'md',
  padding = 'md'
}) => {
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-lg',
    lg: 'shadow-xl'
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <HeroCard className={`bg-white border-0 ${shadowClasses[shadow]} ${className}`}>
      <CardBody className={paddingClasses[padding]}>
        {children}
      </CardBody>
    </HeroCard>
  );
};

interface CardWithHeaderProps extends CardProps {
  title: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

export const CardWithHeader: React.FC<CardWithHeaderProps> = ({
  title,
  subtitle,
  headerAction,
  children,
  className = '',
  shadow = 'md'
}) => {
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-lg',
    lg: 'shadow-xl'
  };

  return (
    <HeroCard className={`bg-white border-0 ${shadowClasses[shadow]} ${className}`}>
      <CardHeader className="flex justify-between items-start px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {headerAction && <div>{headerAction}</div>}
      </CardHeader>
      <CardBody className="p-6">
        {children}
      </CardBody>
    </HeroCard>
  );
};