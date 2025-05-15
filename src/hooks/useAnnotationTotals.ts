import { useMemo } from 'react';
import { Amount, AmountType } from '../types';

interface Totals {
  startingBalance: number;
  credit: number;
  debit: number;
  finalBalance: number;
}

interface UseAnnotationTotalsReturn {
  totals: Totals;
  groupedAnnotations: Record<AmountType, Amount[]>;
}

export const useAnnotationTotals = (currentAnnotations: Amount[]): UseAnnotationTotalsReturn => {
  const totals = useMemo(() => {
    const result: Totals = {
      startingBalance: 0,
      credit: 0,
      debit: 0,
      finalBalance: 0
    };

    currentAnnotations.forEach(annotation => {
      if (annotation.type === 'startingBalance') {
        result.startingBalance = annotation.value;
      } else if (annotation.type === 'credit') {
        result.credit += annotation.value;
      } else if (annotation.type === 'debit') {
        result.debit += annotation.value;
      } else if (annotation.type === 'finalBalance') {
        result.finalBalance = annotation.value;
      }
    });

    return result;
  }, [currentAnnotations]);

  const groupedAnnotations = useMemo(() => {
    return currentAnnotations.reduce((acc, annotation) => {
      if (!acc[annotation.type]) {
        acc[annotation.type] = [];
      }
      acc[annotation.type].push(annotation);
      return acc;
    }, {} as Record<AmountType, Amount[]>);
  }, [currentAnnotations]);

  return {
    totals,
    groupedAnnotations,
  };
}; 