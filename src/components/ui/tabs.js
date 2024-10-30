import React, { useState } from 'react';

export function Tabs({ children, defaultValue, className, ...props }) {
  const [selectedTab, setSelectedTab] = useState(defaultValue);

  return (
    <div className={`${className}`} {...props}>
      {/* Manually pass down selectedTab and setSelectedTab */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { selectedTab, setSelectedTab });
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, className, ...props }) {
  return (
    <div className={`flex space-x-1 rounded-xl bg-blue-900/20 p-1 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function TabsTrigger({ children, value, selectedTab, setSelectedTab, className, ...props }) {
  return (
    <button
      className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${
        selectedTab === value ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
      } ${className}`}
      onClick={() => setSelectedTab(value)} // Here we explicitly update the selected tab
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, selectedTab, className, ...props }) {
  return selectedTab === value ? (
    <div className={`mt-2 rounded-xl bg-white p-3 ${className}`} {...props}>
      {children}
    </div>
  ) : null;
}
