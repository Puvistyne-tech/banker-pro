import React from 'react';
import PdfPageRenderer from './PdfPageRenderer';
import { Amount, AmountType } from '../types';

interface PdfViewerProps {
  pdfPages: any[];
  pdfIsLoading: boolean;
  pdfError: string | null;
  visiblePage: number;
  scale: number;
  handleAnnotationDraw: (rect: any, pageNum: number, type?: AmountType) => void;
  getAnnotationsForPage: (pageNum: number) => Amount[];
  showOverlays: boolean;
  scrollToPage: (pageNum: number) => void;
  legendColors: {
    startingBalance: string;
    credit: string;
    debit: string;
    finalBalance: string;
    eraser: string;
  };
  selectedType: AmountType;
  clearSelectedItems?: boolean;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfPages,
  pdfIsLoading,
  pdfError,
  visiblePage,
  scale,
  handleAnnotationDraw,
  getAnnotationsForPage,
  showOverlays,
  scrollToPage,
  legendColors,
  selectedType,
  clearSelectedItems = false,
}) => {
  return (
    <div className="flex-1 p-6 space-y-8 pb-24">
      {pdfIsLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}
      {pdfError && (
        <div className="text-center text-red-500 dark:text-red-400">
          <p className="text-lg font-medium">Error loading PDF</p>
          <p className="text-sm mt-1">{pdfError}</p>
        </div>
      )}
      <div className="flex flex-col items-center">
        {pdfPages.map((page, index) => (
          <div 
            key={index + 1} 
            className={`pdf-page relative inline-block mb-4 rounded-sm transition-all duration-200 cursor-pointer ${
              index + 1 === visiblePage ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''
            }`}
            onClick={() => scrollToPage(index + 1)}
          >
            <PdfPageRenderer
              page={page}
              pageNumber={index + 1}
              scale={scale}
              onAnnotationDraw={handleAnnotationDraw}
              annotations={getAnnotationsForPage(index + 1)}
              showOverlays={showOverlays}
              legendColors={legendColors}
              selectedType={selectedType}
              clearSelectedItems={clearSelectedItems}
            />
            <div className="absolute bottom-2 right-2 bg-gray-800/50 text-white px-2 py-1 rounded text-sm">
              Page {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 