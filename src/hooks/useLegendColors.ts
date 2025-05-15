import { useState, useCallback } from 'react';
import { AmountType } from '../types';

interface LegendColors {
  startingBalance: string;
  credit: string;
  debit: string;
  finalBalance: string;
  eraser: string;
}

const DEFAULT_COLORS: LegendColors = {
  startingBalance: '#3B82F6', // blue-500
  credit: '#22C55E', // green-500
  debit: '#EF4444', // red-500
  finalBalance: '#A855F7', // purple-500
  eraser: '#6B7280', // gray-500
};

interface UseLegendColorsReturn {
  legendColors: LegendColors;
  handleColorChange: (type: AmountType, color: string) => void;
}

export const useLegendColors = (): UseLegendColorsReturn => {
  const [legendColors, setLegendColors] = useState<LegendColors>(DEFAULT_COLORS);

  const handleColorChange = useCallback((type: AmountType, color: string) => {
    setLegendColors(prev => ({
      ...prev,
      [type]: color
    }));
  }, []);

  return {
    legendColors,
    handleColorChange,
  };
}; 