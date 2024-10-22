import React from 'react';

export function Tabs({ children, className, ...props }) {
  return (
    <div className={`${className}`} {...props}>
      {children}
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

export function TabsTrigger({ children, className, ...props }) {
  return (
    <button
      className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${
        props.selected
          ? 'bg-white shadow'
          : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, className, ...props }) {
  return (
    <div className={`mt-2 rounded-xl bg-white p-3 ${className}`} {...props}>
      {children}
    </div>
  );
}