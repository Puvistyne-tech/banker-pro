import React from 'react';

interface PdfControlsProps {
  scale: number;
  handleZoom: (delta: number) => void;
  currentPageNumber: number;
  numPages: number;
  handlePrevPage: () => void;
  handleNextPage: () => void;
}

export const PdfControls: React.FC<PdfControlsProps> = ({
  scale,
  handleZoom,
  currentPageNumber,
  numPages,
  handlePrevPage,
  handleNextPage,
}) => {
  return (
    <div className="fixed bottom-0 left-0 w-2/3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 shadow-lg">
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleZoom(-0.1)}
            className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {Math.round(scale * 100)}%
          </span>
          <button 
            onClick={() => handleZoom(0.1)}
            className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Zoom In"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrevPage}
            disabled={currentPageNumber <= 1}
            className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous Page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {currentPageNumber} / {numPages || '?'}
          </span>
          <button 
            onClick={handleNextPage}
            disabled={currentPageNumber >= numPages}
            className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next Page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}; 