// src/lib/tauri.ts
import { open, save } from "@tauri-apps/plugin-dialog";
import {
  readFile,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { Amount } from "../types";

export async function openPdfFile(): Promise<{
  filePath: string;
  file: File;
} | null> {
  const selected = await open({
    multiple: false,
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });
  if (typeof selected === "string") {
    try {
      const fileContent = await readFile(selected);
      const blob = new Blob([fileContent], { type: "application/pdf" });
      const fileName = selected.split(/[/\\]/).pop() || "file.pdf";
      const file = new File([blob], fileName, { type: "application/pdf" });
      return { filePath: selected, file };
    } catch (error) {
      console.error("Error reading PDF file:", error);
      throw new Error("Failed to read PDF file");
    }
  }
  return null;
}

export async function saveAnnotationsToFile(
  annotations: Amount[],
  pdfFilePath: string
): Promise<void> {
  const defaultPath = pdfFilePath.replace(/\.pdf$/i, ".annotations.json");
  const filePath = await save({
    defaultPath: defaultPath,
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (filePath) {
    await writeTextFile(filePath, JSON.stringify(annotations, null, 2));
  }
}

export async function loadAnnotationsFromFile(
  pdfFilePath: string
): Promise<Amount[] | null> {
  const defaultPath = pdfFilePath.replace(/\.pdf$/i, ".annotations.json");
  // Try to auto-load from default path first without dialog if it exists
  // This requires checking if file exists, which is more complex with Tauri fs.
  // For now, always show open dialog for annotations.
  const selected = await open({
    defaultPath: defaultPath, // Suggest the companion file
    multiple: false,
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (typeof selected === "string") {
    const content = await readTextFile(selected);
    return JSON.parse(content) as Amount[];
  }
  return null;
}

export async function exportSummary(
  data: {
    verificationResult: any;
    annotations: Amount[];
    summary: any; // like the data table content
  },
  format: "json" | "csv" | "pdf_summary" /* PDF summary is complex */
): Promise<void> {
  const defaultPath = `verification_summary.${format}`;
  const filePath = await save({
    defaultPath,
    filters: [{ name: format.toUpperCase(), extensions: [format] }],
  });

  if (filePath) {
    let content = "";
    if (format === "json") {
      content = JSON.stringify(data, null, 2);
    } else if (format === "csv") {
      // Basic CSV generation - more robust library might be needed for complex cases
      const headers = ["Date", "Label", "Credit", "Debit"]; // Example headers
      const rows = data.annotations // This needs more structure for a good CSV
        .filter((a) => a.type === "credit" || a.type === "debit") // Example filter
        .map((a) => [
          "", // Date - not captured yet
          `Page ${a.pageNumber} - ${a.type}`, // Label
          a.type === "credit" ? a.value : "",
          a.type === "debit" ? a.value : "",
        ]);
      content = [headers.join(","), ...rows.map((row) => row.join(","))].join(
        "\n"
      );
      // Add summary info
      content += `\n\nCalculated Balance,${data.verificationResult.calculatedFinalBalance}`;
      content += `\nActual Balance,${data.verificationResult.selectedFinalBalance}`;
      content += `\nStatus,${data.verificationResult.message}`;
    } else if (format === "pdf_summary") {
      // TODO: PDF summary generation is a whole sub-project.
      // Could use pdf-lib to create a new PDF with text and tables.
      alert("PDF Summary export is not implemented in this example.");
      return;
    }
    await writeTextFile(filePath, content);
    alert(`Exported to ${filePath}`);
  }
}
