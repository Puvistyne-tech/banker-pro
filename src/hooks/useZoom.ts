import { useState, useCallback, useRef, useEffect } from 'react';

export const useZoom = () => {
  const [scale, setScale] = useState(1.0);
  const zoomTimeoutRef = useRef<NodeJS.Timeout>();
  const lastZoomTimeRef = useRef<number>(0);

  const handleZoom = useCallback((delta: number) => {
    const now = Date.now();
    const timeSinceLastZoom = now - lastZoomTimeRef.current;
    
    // Clear any pending zoom
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
    }

    // If zooming too quickly, debounce it
    if (timeSinceLastZoom < 16) { // ~60fps
      zoomTimeoutRef.current = setTimeout(() => {
        setScale((currentScale) => {
          const newScale = currentScale * (1 + delta);
          return Math.min(Math.max(newScale, 0.2), 3);
        });
        lastZoomTimeRef.current = Date.now();
      }, 16);
    } else {
      // If zooming at a reasonable rate, apply immediately
      setScale((currentScale) => {
        const newScale = currentScale * (1 + delta);
        return Math.min(Math.max(newScale, 0.2), 3);
      });
      lastZoomTimeRef.current = now;
    }
  }, []);

  // Handle wheel events with improved performance
  const handleWheel = useCallback((e: Event) => {
    const wheelEvent = e as WheelEvent;
    if (wheelEvent.ctrlKey || wheelEvent.metaKey) {
      e.preventDefault();
      
      // Handle different wheel event modes (pixel, line, page)
      let delta = 0;
      if (wheelEvent.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
        // For trackpad gestures, use a smaller multiplier
        delta = wheelEvent.deltaY * -0.001;
      } else {
        // For mouse wheel, use the original behavior
        delta = wheelEvent.deltaY > 0 ? -0.1 : 0.1;
      }
      
      // Apply zoom with debouncing
      handleZoom(delta);
    }
  }, [handleZoom]);

  // Add wheel event listener with proper options
  useEffect(() => {
    const pdfContainer = document.querySelector('.pdf-container');
    if (pdfContainer) {
      pdfContainer.addEventListener('wheel', handleWheel as EventListener, false);
      return () => {
        pdfContainer.removeEventListener('wheel', handleWheel as EventListener, false);
      };
    }
  }, [handleWheel]);

  // Clean up zoom timeout on unmount
  useEffect(() => {
    return () => {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
    };
  }, []);

  return { scale, handleZoom };
}; 