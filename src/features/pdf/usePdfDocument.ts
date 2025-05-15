// src/features/pdf/usePdfDocument.ts
import { useState, useCallback } from 'react';
import { pdfjsLib, loadPdf as loadPdfUtil } from './pdfUtils';
import { useAnnotationStore } from '../annotations/annotationStore';

export interface PdfPageInfo {
  pageNumber: number;
  width: number;
  height: number;
  scale: number;
}

export function usePdfDocument() {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);

  const { setPdfPath: setStorePdfPath, clearAnnotations: storeClearAnnotations } = useAnnotationStore.getState();

  const loadPdf = useCallback(async (fileSource: File | string) => { // string can be a path
    setIsLoading(true);
    setError(null);
    setPdfDoc(null); // Clear previous doc
    setNumPages(0);
    setCurrentPageNumber(1);
    storeClearAnnotations(); // Clear annotations for new PDF

    try {
      let doc: pdfjsLib.PDFDocumentProxy;
      let filePathForStore: string;

      if (typeof fileSource === 'string') { // Path provided
        // For Tauri, we need to fetch the file content if using a path from dialog
        // This part needs careful handling of how Tauri serves local files or if we pass ArrayBuffer
        // For simplicity, assume `fileSource` as path is converted to `File` or `ArrayBuffer` before this hook.
        // Or, if using Tauri file system directly:
        // const binaryData = await readBinaryFile(fileSource);
        // doc = await loadPdfUtil(binaryData);
        // filePathForStore = fileSource;
        // setCurrentFile(null); // Or construct a File object if needed
        // For now, this hook expects File object primarily
        throw new Error("Direct path loading needs specific Tauri fs integration not shown here, pass File object.")
      } else { // File object provided
        doc = await loadPdfUtil(fileSource);
        filePathForStore = fileSource.name; // Or a more unique identifier if available
        setCurrentFile(fileSource);
      }
      
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setStorePdfPath(filePathForStore); // Set in Zustand store
      setCurrentFilePath(filePathForStore); // Local state if needed for display
    } catch (err: any) {
      setError(err.message || 'Failed to load PDF.');
      console.error("PDF Load Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [storeClearAnnotations, setStorePdfPath]);


  const getPage = useCallback(async (pageNum: number): Promise<pdfjsLib.PDFPageProxy | null> => {
    if (!pdfDoc || pageNum < 1 || pageNum > numPages) return null;
    try {
      return await pdfDoc.getPage(pageNum);
    } catch (err: any) {
      setError(err.message || `Failed to load page ${pageNum}.`);
      return null;
    }
  }, [pdfDoc, numPages]);

  return {
    pdfDoc,
    numPages,
    currentPageNumber,
    setCurrentPageNumber,
    loadPdf,
    getPage,
    isLoading,
    error,
    currentFile,
    currentFilePath
  };
}