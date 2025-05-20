import React from 'react';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

const DashboardWidget = ({ 
  title, 
  icon, 
  children, 
  footer, 
  isLoading = false 
}) => {
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          {icon && <span className="mr-2 text-gray-500">{icon}</span>}
          {title}
        </h3>
      </div>
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          children
        )}
      </div>
      {footer && (
        <div className="bg-gray-50 px-4 py-3 border-t">
          {footer}
        </div>
      )}
    </Card>
  );
};

export default DashboardWidget; 