// src/features/annotations/annotationStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Annotation, AnnotationType } from "../../types";
import { v4 as uuidv4 } from "uuid"; // npm install uuid @types/uuid

// For undo/redo
interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface VirtualTableEntry {
  id: string;
  type: AnnotationType;
  value: number;
  rawValue: string;
  pageNumber: number;
  timestamp: number;
}

interface AnnotationsState {
  annotationsHistory: HistoryState<Annotation[]>;
  virtualTable: VirtualTableEntry[];
  currentPdfPath: string | null; // To associate annotations with a PDF
  showOverlays: boolean;

  setPdfPath: (path: string | null) => void;
  addAnnotation: (
    annotationData: Omit<Annotation, "id" | "value"> & {
      rawValue: string;
      value: number;
    }
  ) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  clearAnnotations: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  toggleOverlays: () => void;
  getAnnotationsForPage: (pageNumber: number) => Annotation[];
  getAnnotationsByType: (type: AnnotationType) => Annotation[];
  getStartingBalance: () => Annotation | undefined;
  getFinalBalance: () => Annotation | undefined;
  getTotalCredits: () => number;
  getTotalDebits: () => number;
  setAnnotations: (annotations: Annotation[]) => void; // For loading from file
  _updateHistory: (newPresent: Annotation[]) => void;

  // New methods for virtual table
  addToVirtualTable: (entry: Omit<VirtualTableEntry, "id" | "timestamp">) => void;
  removeFromVirtualTable: (id: string) => void;
  clearVirtualTable: () => void;
  getVirtualTableEntries: () => VirtualTableEntry[];
  getVirtualTableEntriesByType: (type: AnnotationType) => VirtualTableEntry[];
  getVirtualTableTotals: () => {
    startingBalance: number;
    credit: number;
    debit: number;
    finalBalance: number;
  };
}

const initialAnnotationsState: Annotation[] = [];
const initialHistory: HistoryState<Annotation[]> = {
  past: [],
  present: initialAnnotationsState,
  future: [],
};

export const useAnnotationStore = create<AnnotationsState>()(
  devtools(
    // Not using persist middleware for now, as we'll handle persistence via explicit file save/load
    // persist( // If you want browser-based persistence (e.g., IndexedDB)
    (set, get) => ({
      annotationsHistory: initialHistory,
      virtualTable: [],
      currentPdfPath: null,
      showOverlays: true,

      setPdfPath: (path) =>
        set({ 
          currentPdfPath: path, 
          annotationsHistory: initialHistory,
          virtualTable: [] // Clear virtual table when changing PDF
        }),

      _updateHistory: (newPresent: Annotation[]) => {
        set((state) => ({
          annotationsHistory: {
            past: [...state.annotationsHistory.past, state.annotationsHistory.present],
            present: newPresent,
            future: [],
          },
        }));
      },

      addAnnotation: (annotationData) => {
        const newAnnotation: Annotation = {
          id: uuidv4(),
          ...annotationData,
        };
        let currentAnnotations = [...get().annotationsHistory.present];
        if (
          newAnnotation.type === "startingBalance" ||
          newAnnotation.type === "finalBalance"
        ) {
          currentAnnotations = currentAnnotations.filter(
            (a) => a.type !== newAnnotation.type
          );
        }
        get()._updateHistory([...currentAnnotations, newAnnotation]);
        
        // Also add to virtual table
        get().addToVirtualTable({
          type: newAnnotation.type,
          value: newAnnotation.value,
          rawValue: newAnnotation.rawValue || '',
          pageNumber: newAnnotation.pageNumber,
        });
      },

      // New virtual table methods
      addToVirtualTable: (entry) => {
        const newEntry: VirtualTableEntry = {
          id: uuidv4(),
          timestamp: Date.now(),
          ...entry,
        };

        set((state) => {
          let newTable = [...state.virtualTable];
          
          // Handle starting/final balance (only one of each)
          if (entry.type === "startingBalance" || entry.type === "finalBalance") {
            newTable = newTable.filter(e => e.type !== entry.type);
          }
          
          return { virtualTable: [...newTable, newEntry] };
        });
      },

      removeFromVirtualTable: (id) => {
        set((state) => ({
          virtualTable: state.virtualTable.filter(entry => entry.id !== id)
        }));
      },

      clearVirtualTable: () => {
        set({ virtualTable: [] });
      },

      getVirtualTableEntries: () => get().virtualTable,

      getVirtualTableEntriesByType: (type) => 
        get().virtualTable.filter(entry => entry.type === type),

      getVirtualTableTotals: () => {
        const table = get().virtualTable;
        return {
          startingBalance: table.find(e => e.type === "startingBalance")?.value || 0,
          credit: table
            .filter(e => e.type === "credit")
            .reduce((sum, e) => sum + e.value, 0),
          debit: table
            .filter(e => e.type === "debit")
            .reduce((sum, e) => sum + e.value, 0),
          finalBalance: table.find(e => e.type === "finalBalance")?.value || 0,
        };
      },

      // Keep existing methods but update them to use virtual table
      getStartingBalance: () => {
        const entry = get().virtualTable.find(e => e.type === "startingBalance");
        return entry ? {
          id: entry.id,
          type: entry.type,
          value: entry.value,
          rawValue: entry.rawValue || '', // Provide default empty string
          pageNumber: entry.pageNumber,
          rect: { x: 0, y: 0, width: 0, height: 0 } // Placeholder rect
        } : undefined;
      },

      getFinalBalance: () => {
        const entry = get().virtualTable.find(e => e.type === "finalBalance");
        return entry ? {
          id: entry.id,
          type: entry.type,
          value: entry.value,
          rawValue: entry.rawValue || '', // Provide default empty string
          pageNumber: entry.pageNumber,
          rect: { x: 0, y: 0, width: 0, height: 0 } // Placeholder rect
        } : undefined;
      },

      getTotalCredits: () => 
        get().virtualTable
          .filter(e => e.type === "credit")
          .reduce((sum, e) => sum + e.value, 0),

      getTotalDebits: () => 
        get().virtualTable
          .filter(e => e.type === "debit")
          .reduce((sum, e) => sum + e.value, 0),

      // Keep other existing methods
      updateAnnotation: (id, updates) => {
        const updatedAnnotations = get().annotationsHistory.present.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        );
        get()._updateHistory(updatedAnnotations);
      },

      deleteAnnotation: (id) => {
        const filteredAnnotations = get().annotationsHistory.present.filter(
          (a) => a.id !== id
        );
        get()._updateHistory(filteredAnnotations);
        get().removeFromVirtualTable(id);
      },

      clearAnnotations: () => {
        get()._updateHistory([]);
        get().clearVirtualTable();
      },

      setAnnotations: (annotations) => {
        set({
          annotationsHistory: { past: [], present: annotations, future: [] },
        });
        // Also update virtual table
        annotations.forEach(ann => {
          get().addToVirtualTable({
            type: ann.type,
            value: ann.value,
            rawValue: ann.rawValue || '',
            pageNumber: ann.pageNumber,
          });
        });
      },

      undo: () => {
        set((state) => {
          const { past, present, future } = state.annotationsHistory;
          if (past.length === 0) return {};
          const previous = past[past.length - 1];
          const newPast = past.slice(0, past.length - 1);
          return {
            annotationsHistory: {
              past: newPast,
              present: previous,
              future: [present, ...future],
            },
          };
        });
      },

      redo: () => {
        set((state) => {
          const { past, present, future } = state.annotationsHistory;
          if (future.length === 0) return {};
          const next = future[0];
          const newFuture = future.slice(1);
          return {
            annotationsHistory: {
              past: [...past, present],
              present: next,
              future: newFuture,
            },
          };
        });
      },

      canUndo: () => get().annotationsHistory.past.length > 0,
      canRedo: () => get().annotationsHistory.future.length > 0,
      toggleOverlays: () => set((state) => ({ showOverlays: !state.showOverlays })),
      getAnnotationsForPage: (pageNumber) =>
        get().annotationsHistory.present.filter((a) => a.pageNumber === pageNumber),
      getAnnotationsByType: (type) =>
        get().annotationsHistory.present.filter((a) => a.type === type),
    })
    //   { // Persist config
    //     name: 'bank-statement-verifier-annotations',
    //     // storage: createJSONStorage(() => localStorage), // or IndexedDB
    //   }
    // )
  )
);

// Listen for changes to currentPdfPath to potentially load/save annotations for that file
// This part is complex because it involves async fs operations from Tauri.
// For now, we keep it manual: user explicitly saves/loads annotations.
