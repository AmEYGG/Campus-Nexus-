import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext({});

const Tabs = React.forwardRef(({ value, defaultValue, onValueChange, className, ...props }, ref) => {
  const [activeTab, setActiveTab] = useState(value || defaultValue);

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, handleTabChange }}>
      <div ref={ref} className={className} {...props} />
    </TabsContext.Provider>
  );
});

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}
    {...props}
  />
));

const TabsTrigger = React.forwardRef(({ value, className, ...props }, ref) => {
  const { activeTab, handleTabChange } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => handleTabChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive 
          ? 'bg-white text-gray-950 shadow-sm' 
          : 'text-gray-500 hover:text-gray-900'
      } ${className}`}
      {...props}
    />
  );
});

const TabsContent = React.forwardRef(({ value, className, ...props }, ref) => {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== value) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 ${className}`}
      {...props}
    />
  );
});

Tabs.displayName = 'Tabs';
TabsList.displayName = 'TabsList';
TabsTrigger.displayName = 'TabsTrigger';
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent }; 