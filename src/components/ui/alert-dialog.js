import React from 'react';

export function AlertDialog({ children, open, onOpenChange }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      {children}
    </div>
  );
}

export function AlertDialogContent({ children }) {
  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
      {children}
    </div>
  );
}

export function AlertDialogHeader({ children }) {
  return <div className="p-6">{children}</div>;
}

export function AlertDialogFooter({ children }) {
  return (
    <div className="p-6 bg-gray-50 flex justify-end space-x-2 rounded-b-lg">
      {children}
    </div>
  );
}

export function AlertDialogTitle({ children }) {
  return <h2 className="text-xl font-semibold mb-2">{children}</h2>;
}

export function AlertDialogDescription({ children }) {
  return <p className="text-gray-500">{children}</p>;
}

export function AlertDialogAction({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
    >
      {children}
    </button>
  );
}

export function AlertDialogCancel({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
    >
      {children}
    </button>
  );
}
