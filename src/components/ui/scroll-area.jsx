import React from 'react';
import { cn } from '../../lib/utils';

const ScrollArea = React.forwardRef(({ className, style, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'overflow-auto',
      className
    )}
    style={{ maxHeight: '400px', ...style }}
    {...props}
  >
    {children}
  </div>
));

ScrollArea.displayName = 'ScrollArea';

export { ScrollArea }; 