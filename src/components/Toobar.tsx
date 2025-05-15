// src/components/Toolbar.tsx
import React from 'react';
// Example: using placeholder icons or simple text for buttons
// You'd use an icon library like lucide-react with shadcn/ui

interface ToolbarProps {
  onUpload?: () => void;  // Made optional
  onZoomIn: () => void;
  onZoomOut: () => void;
  currentZoom: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  currentPage: number;
  numPages: number;
  canUndo: () => boolean;
  onUndo: () => void;
  canRedo: () => boolean;
  onRedo: () => void;
  showOverlays: boolean;
  onToggleOverlays: () => void;
  onSaveAnnotations: () => void;
  onLoadAnnotations: () => void;
  onExport: (format: 'json' | 'csv') => void; // Add PDF later
}

const Toolbar: React.FC<ToolbarProps> = (props) => {
  return (
    <div className="p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <button 
          onClick={props.onZoomOut}
          className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {Math.round(props.currentZoom * 100)}%
        </span>
        <button 
          onClick={props.onZoomIn}
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
          onClick={props.onPrevPage} 
          disabled={props.currentPage <= 1}
          className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous Page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {props.currentPage} / {props.numPages || '?'}
        </span>
        <button 
          onClick={props.onNextPage} 
          disabled={props.currentPage >= props.numPages}
          className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next Page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={props.onUndo} 
          disabled={!props.canUndo()}
          className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        <button 
          onClick={props.onRedo} 
          disabled={!props.canRedo()}
          className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.743 3.099c-.765-1.36-2.722-1.36-3.486 0l-5.58 9.92c-.75 1.334.213 2.98 1.742 2.98h11.162c1.53 0 2.493-1.646 1.743-2.98l-5.58-9.92zM9 13a1 1 0 102 0 1 1 0 00-2 0zm1-8a1 1 0 011 1v3a1 1 0 11-2 0V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <button 
        onClick={props.onToggleOverlays}
        className={`p-2 rounded-lg transition-colors ${
          props.showOverlays 
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' 
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title={props.showOverlays ? 'Hide Overlays' : 'Show Overlays'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>

      <div className="flex items-center gap-2">
        <button 
          onClick={props.onSaveAnnotations}
          className="p-2 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
          title="Save Annotations"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <button 
          onClick={props.onLoadAnnotations}
          className="p-2 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
          title="Load Annotations"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => props.onExport('json')}
          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          Export JSON
        </button>
        <button 
          onClick={() => props.onExport('csv')}
          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          Export CSV
        </button>
      </div>
    </div>
  );
};

export default Toolbar;