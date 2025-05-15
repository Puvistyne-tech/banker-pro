import React from 'react';

interface EmptyStateProps {
  onUpload: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onUpload }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
      <div className="text-center space-y-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <p className="text-2xl font-medium text-gray-600 dark:text-gray-300">
          Upload a PDF to begin
        </p>
        <button
          onClick={onUpload}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Upload PDF
        </button>
      </div>
    </div>
  );
}; 