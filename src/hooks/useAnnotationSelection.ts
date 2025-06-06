import { useCallback } from 'react';
import { AmountType } from '../types';
import { parseFrenchCurrency } from '../utils/numberUtils';

interface Rect {
  text: string;
  [key: string]: any;
}

interface UseAnnotationSelectionProps {
  handleSaveAnnotation: (type: AmountType, value: number, text: string) => void;
  handleAnnotationDraw: (rect: Rect, pageNum: number, type?: AmountType) => void;
  selectedType: AmountType;
}

interface UseAnnotationSelectionReturn {
  handleAnnotationSelection: (rect: Rect, pageNum: number) => void;
}

export const useAnnotationSelection = ({
  handleSaveAnnotation,
  handleAnnotationDraw,
  selectedType,
}: UseAnnotationSelectionProps): UseAnnotationSelectionReturn => {
  const handleAnnotationSelection = useCallback((rect: Rect, pageNum: number) => {
    // Get the full text value
    const value = parseFrenchCurrency(rect.text);
    if (value !== null) {
      // Save the annotation
      handleSaveAnnotation(selectedType, value, rect.text);
      // Update visual representation
      handleAnnotationDraw(rect, pageNum, selectedType);
    }
  }, [handleSaveAnnotation, handleAnnotationDraw, selectedType]);

  return {
    handleAnnotationSelection,
  };
}; 