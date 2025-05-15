import { useState } from 'react';
import { useAnnotationStore } from '../features/annotations/annotationStore';
import { AnnotationType } from '../types';
import { saveAnnotationsToFile, loadAnnotationsFromFile, exportSummary } from '../lib/tauri';
import { verifyBalances } from '../features/verifications/verificationEngine';

interface UseAnnotationHandlersProps {
  currentPdfPath: string | null;
}

export const useAnnotationHandlers = ({ currentPdfPath }: UseAnnotationHandlersProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAnnotationRect, setPendingAnnotationRect] = useState<any | null>(null);
  const [pendingAnnotationPage, setPendingAnnotationPage] = useState<number | null>(null);

  // Annotation Store
  const annotationsHistory = useAnnotationStore((state) => state.annotationsHistory);
  const addAnnotation = useAnnotationStore((state) => state.addAnnotation);
  const undo = useAnnotationStore((state) => state.undo);
  const redo = useAnnotationStore((state) => state.redo);
  const canUndo = useAnnotationStore((state) => state.canUndo);
  const canRedo = useAnnotationStore((state) => state.canRedo);
  const showOverlays = useAnnotationStore((state) => state.showOverlays);
  const toggleOverlays = useAnnotationStore((state) => state.toggleOverlays);
  const getAnnotationsForPage = useAnnotationStore((state) => state.getAnnotationsForPage);
  const getStartingBalance = useAnnotationStore((state) => state.getStartingBalance);
  const getFinalBalance = useAnnotationStore((state) => state.getFinalBalance);
  const getTotalCredits = useAnnotationStore((state) => state.getTotalCredits);
  const getTotalDebits = useAnnotationStore((state) => state.getTotalDebits);
  const setAnnotations = useAnnotationStore((state) => state.setAnnotations);
  const clearAnnotations = useAnnotationStore((state) => state.clearAnnotations);

  const currentAnnotations = annotationsHistory.present;

  const handleAnnotationDraw = (rect: any, pageNum: number) => {
    setPendingAnnotationRect(rect);
    setPendingAnnotationPage(pageNum);
    setIsModalOpen(true);
  };

  const handleSaveAnnotation = (
    type: AnnotationType,
    value: number,
    rawValue: string
  ) => {
    if (pendingAnnotationRect && pendingAnnotationPage !== null) {
      const { text, ...rect } = pendingAnnotationRect;
      addAnnotation({
        pageNumber: pendingAnnotationPage,
        rect: rect as {
          x: number;
          y: number;
          width: number;
          height: number;
        },
        value,
        rawValue: text || rawValue,
        type,
      });
    }
    setIsModalOpen(false);
    setPendingAnnotationRect(null);
    setPendingAnnotationPage(null);
  };

  const handleSaveAnnotationsToFile = async () => {
    if (currentPdfPath && currentAnnotations.length > 0) {
      await saveAnnotationsToFile(currentAnnotations, currentPdfPath);
      alert("Annotations saved!");
    } else {
      alert("No PDF loaded or no annotations to save.");
    }
  };

  const handleLoadAnnotationsFromFile = async () => {
    if (currentPdfPath) {
      const loadedAnnots = await loadAnnotationsFromFile(currentPdfPath);
      if (loadedAnnots) {
        setAnnotations(loadedAnnots);
        alert("Annotations loaded!");
      }
    } else {
      alert("Please load a PDF file first to load annotations for it.");
    }
  };

  const handleExport = async (format: "json" | "csv") => {
    const verificationResultData = verifyBalances(
      getStartingBalance(),
      getFinalBalance(),
      getTotalCredits(),
      getTotalDebits()
    );
    const exportData = {
      verificationResult: verificationResultData,
      annotations: currentAnnotations,
      summary: {
        startingBalance: getStartingBalance()?.value,
        totalCredits: getTotalCredits(),
        totalDebits: getTotalDebits(),
        calculatedFinalBalance: verificationResultData.calculatedFinalBalance,
        actualFinalBalance: getFinalBalance()?.value,
        status: verificationResultData.message,
      },
    };
    await exportSummary(exportData, format);
  };

  return {
    isModalOpen,
    setIsModalOpen,
    pendingAnnotationRect,
    pendingAnnotationPage,
    currentAnnotations,
    handleAnnotationDraw,
    handleSaveAnnotation,
    handleSaveAnnotationsToFile,
    handleLoadAnnotationsFromFile,
    handleExport,
    undo,
    redo,
    canUndo,
    canRedo,
    showOverlays,
    toggleOverlays,
    getAnnotationsForPage,
    clearAnnotations,
  };
}; 