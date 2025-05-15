import { useState, useEffect, useCallback } from 'react';

interface RightPanelState {
  rightPanelWidth: number;
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: MouseEvent) => void;
  handleMouseUp: () => void;
}

const MIN_PANEL_WIDTH = 300;
const DEFAULT_PANEL_WIDTH = 400;

export const useRightPanel = (): RightPanelState => {
  const [rightPanelWidth, setRightPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= MIN_PANEL_WIDTH && newWidth <= window.innerWidth - MIN_PANEL_WIDTH) {
        setRightPanelWidth(newWidth);
      }
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    rightPanelWidth,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}; 