// src/types/index.ts
export type AmountType = 'startingBalance' | 'credit' | 'debit' | 'finalBalance' | 'eraser'; 

export interface Amount {
  id: string;
  pageNumber: number;
  rect: { // Relative to the unscaled page
    x: number;
    y: number;
    width: number;
    height: number;
  };
  value: number; // Parsed numeric value
  rawValue?: string; // Raw string user might have entered if parsing failed or for display
  type: AmountType;
}

export interface VerificationResult {
  calculatedFinalBalance: number;
  selectedFinalBalance: number | null;
  isValid: boolean | null; // null if not enough data
  message: string;
}

