import { useMemo } from 'react';
import { Annotation, AnnotationType } from '../types';

interface Totals {
  startingBalance: number;
  credit: number;
  debit: number;
  finalBalance: number;
}

interface UseAnnotationTotalsReturn {
  totals: Totals;
  groupedAnnotations: Record<AnnotationType, Annotation[]>;
}

export const useAnnotationTotals = (currentAnnotations: Annotation[]): UseAnnotationTotalsReturn => {
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
    }, {} as Record<AnnotationType, Annotation[]>);
  }, [currentAnnotations]);

  return {
    totals,
    groupedAnnotations,
  };
}; 