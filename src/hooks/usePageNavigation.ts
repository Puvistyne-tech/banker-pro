import { useCallback, useState, RefObject } from 'react';

interface UsePageNavigationProps {
  pdfContainerRef: RefObject<HTMLDivElement>;
  currentPageNumber: number;
  setCurrentPageNumber: (page: number) => void;
  numPages: number;
}

export const usePageNavigation = ({ 
  pdfContainerRef, 
  currentPageNumber, 
  setCurrentPageNumber,
  numPages 
}: UsePageNavigationProps) => {
  const [visiblePage, setVisiblePage] = useState<number>(1);

  const scrollToPage = useCallback((pageNumber: number) => {
    if (!pdfContainerRef.current) return;
    
    const pageElements = pdfContainerRef.current.getElementsByClassName('pdf-page');
    const targetPage = pageElements[pageNumber - 1];
    
    if (targetPage) {
      targetPage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setCurrentPageNumber(pageNumber);
      setVisiblePage(pageNumber);
    }
  }, [pdfContainerRef, setCurrentPageNumber]);

  const handlePrevPage = useCallback(() => {
    if (currentPageNumber > 1) {
      scrollToPage(currentPageNumber - 1);
    }
  }, [currentPageNumber, scrollToPage]);

  const handleNextPage = useCallback(() => {
    if (currentPageNumber < numPages) {
      scrollToPage(currentPageNumber + 1);
    }
  }, [currentPageNumber, numPages, scrollToPage]);

  return {
    visiblePage,
    scrollToPage,
    handlePrevPage,
    handleNextPage
  };
}; 