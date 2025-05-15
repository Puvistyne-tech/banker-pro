import { useState, useEffect } from 'react';
import { usePdfDocument } from '../features/pdf/usePdfDocument';
import { openPdfFile } from '../lib/tauri';

export const usePdfLoader = () => {
  const {
    pdfDoc,
    numPages,
    currentPageNumber,
    setCurrentPageNumber,
    loadPdf,
    getPage,
    isLoading: pdfIsLoading,
    error: pdfError,
    currentFilePath,
  } = usePdfDocument();

  const [pdfPages, setPdfPages] = useState<any[]>([]);

  // Load all pages when PDF document changes
  useEffect(() => {
    const loadAllPages = async () => {
      if (pdfDoc) {
        const pages = await Promise.all(
          Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) =>
            getPage(pageNum)
          )
        );
        setPdfPages(pages);
      } else {
        setPdfPages([]);
      }
    };
    loadAllPages();
  }, [pdfDoc, numPages, getPage]);

  const handleFileUpload = async () => {
    const selection = await openPdfFile();
    if (selection) {
      await loadPdf(selection.file);
      // const defaultAnnotsPath = selection.filePath.replace(
      //   /\.pdf$/i,
      //   ".annotations.json"
      // );
      try {
        console.log(
          "Skipping auto-load of annotations in this simplified example."
        );
      } catch (e) {
        console.info("No companion annotation file found or error loading:", e);
      }
    }
  };

  const closePdf = async () => {
    setPdfPages([]);
    // Reset the PDF document state
    await loadPdf(new File([], ''));
  };

  return {
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
  };
};
