import React from 'react';

export function Progress({ value, max = 100, className, ...props }) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`} {...props}>
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${(value / max) * 100}%` }}
      ></div>
    </div>
  );
}