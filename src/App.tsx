// src/App.tsx
import { useRef, useEffect, useState, useCallback } from "react";
import { useZoom } from "./hooks/useZoom";
import { usePageNavigation } from "./hooks/usePageNavigation";
import { useAnnotationHandlers } from "./hooks/useAnnotationHandlers";
import { usePdfLoader } from "./hooks/usePdfLoader";
import { PdfViewer } from "./components/PdfViewer";
import { PdfControls } from "./components/PdfControls";
import { EmptyState } from "./components/EmptyState";
import { setupAppMenu } from './menu';
import { AnnotationType } from './types';
import DataSummaryTable from "./components/DataSummaryTable";
import Legend from "./components/Legend";
import { useRightPanel } from "./hooks/useRightPanel";
import { useLegendColors } from "./hooks/useLegendColors";
import { useAnnotationTotals } from "./hooks/useAnnotationTotals";
import { useAnnotationSelection } from "./hooks/useAnnotationSelection";
import { AnnotationsTable } from "./components/AnnotationsTable";

function App() {
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const { rightPanelWidth, handleMouseDown } = useRightPanel();
  const [selectedType, setSelectedType] = useState<AnnotationType>('credit');
  const { legendColors, handleColorChange } = useLegendColors();
  const [clearSelectedItems, setClearSelectedItems] = useState(false);

  // PDF Loading
  const {
    pdfDoc,
    numPages,
    currentPageNumber,
    setCurrentPageNumber,
    pdfPages,
    pdfIsLoading,
    pdfError,
    currentFilePath,
    handleFileUpload,
    closePdf,
  } = usePdfLoader();

  // Zoom State and Handlers
  const { scale, handleZoom } = useZoom();

  // Page Navigation State and Handlers
  const { visiblePage, scrollToPage, handlePrevPage, handleNextPage } =
    usePageNavigation({
      pdfContainerRef,
      currentPageNumber,
      setCurrentPageNumber,
      numPages,
    });

  // Annotation Handlers
  const {
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
  } = useAnnotationHandlers({ currentPdfPath: currentFilePath });

  const { handleAnnotationSelection } = useAnnotationSelection({
    handleSaveAnnotation,
    handleAnnotationDraw,
    selectedType,
  });

  const { groupedAnnotations } = useAnnotationTotals(currentAnnotations);

  // Wrap clearAnnotations to also clear selected items
  const handleClearAnnotations = useCallback(() => {
    clearAnnotations();
    setClearSelectedItems(true);
    // Reset the flag after a short delay to allow components to react
    setTimeout(() => setClearSelectedItems(false), 100);
  }, [clearAnnotations]);

  useEffect(() => {
    setupAppMenu({
      pdfDoc,
      handleFileUpload,
      closePdf,
      handleSaveAnnotationsToFile,
      handleLoadAnnotationsFromFile,
      handleExport,
      undo,
      redo,
      canUndo,
      canRedo,
      toggleOverlays,
      handleZoom,
      currentAnnotations
    });
  }, [pdfDoc, handleFileUpload, closePdf, handleSaveAnnotationsToFile, handleLoadAnnotationsFromFile, handleExport, undo, redo, canUndo, canRedo, toggleOverlays, handleZoom, currentAnnotations]);

  return (
    <div className="h-screen w-screen bg-gray-50 dark:bg-gray-900 flex flex-row">
      {/* Left Side - PDF Viewer */}
      <div
        className="bg-white dark:bg-gray-800 overflow-y-auto pdf-container relative flex flex-col"
        style={{ width: `calc(100% - ${rightPanelWidth}px)` }}
        ref={pdfContainerRef}
      >
        {!pdfDoc && !pdfIsLoading && !pdfError && (
          <EmptyState onUpload={handleFileUpload} />
        )}

        <PdfViewer
          pdfPages={pdfPages}
          pdfIsLoading={pdfIsLoading}
          pdfError={pdfError}
          visiblePage={visiblePage}
          scale={scale}
          handleAnnotationDraw={handleAnnotationSelection}
          getAnnotationsForPage={getAnnotationsForPage}
          showOverlays={showOverlays}
          scrollToPage={scrollToPage}
          legendColors={legendColors}
          selectedType={selectedType}
          clearSelectedItems={clearSelectedItems}
        />

        <PdfControls
          scale={scale}
          handleZoom={handleZoom}
          currentPageNumber={currentPageNumber}
          numPages={numPages}
          handlePrevPage={handlePrevPage}
          handleNextPage={handleNextPage}
        />
      </div>

      {/* Resizer */}
      <div
        className="w-1 bg-gray-200 dark:bg-gray-700 cursor-col-resize hover:bg-blue-500 active:bg-blue-600"
        onMouseDown={handleMouseDown}
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0 }}
      />

      {/* Right Side - All Other Components */}
      <div style={{ width: rightPanelWidth }} className="flex flex-col">
        {/* Legend Controls */}
        <Legend
          legendColors={legendColors}
          selectedType={selectedType}
          onTypeSelect={setSelectedType}
          onColorChange={handleColorChange}
          clearAnnotations={handleClearAnnotations}
        />

        {/* Summary Table */}
        <div className="p-4 border-b border-gray-200">
          <DataSummaryTable 
            annotations={currentAnnotations} 
            legendColors={legendColors}
          />
        </div>

        {/* Annotations Table */}
        <AnnotationsTable 
          groupedAnnotations={groupedAnnotations}
          legendColors={legendColors}
        />
      </div>
    </div>
  );
}

export default App;
