import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  breadcrumbs
}) => {
  return (
    <div className="mb-8">
      {breadcrumbs && (
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="text-gray-400 mx-2">/</span>}
                <span className={`text-sm ${
                  index === breadcrumbs.length - 1 
                    ? 'text-gray-900 font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                  {crumb.label}
                </span>
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
};