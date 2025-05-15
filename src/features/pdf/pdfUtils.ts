// src/features/pdf/pdfUtils.ts
import * as pdfjsLib from "pdfjs-dist";

// Configure the worker for Tauri environment using window.location.origin
const workerSrc = new URL('/pdf.worker.min.mjs', window.location.origin).href;
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export { pdfjsLib };

export async function loadPdf(
  file: File | ArrayBuffer
): Promise<pdfjsLib.PDFDocumentProxy> {
  let data: ArrayBuffer;
  if (file instanceof File) {
    data = await file.arrayBuffer();
  } else {
    data = file;
  }
  return pdfjsLib.getDocument({ data }).promise;
}
