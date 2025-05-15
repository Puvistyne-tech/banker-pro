// src/features/verification/verificationEngine.ts
import { Annotation, VerificationResult } from '../../types';

export function verifyBalances(
  startingBalance: Annotation | undefined,
  finalBalance: Annotation | undefined,
  totalCredits: number,
  totalDebits: number
): VerificationResult {
  if (!startingBalance) {
    return {
      calculatedFinalBalance: 0,
      selectedFinalBalance: finalBalance?.value ?? null,
      isValid: null,
      message: '⚠️ Starting balance not selected.',
    };
  }

  const calculated = startingBalance.value + totalCredits - totalDebits;

  if (!finalBalance) {
    return {
      calculatedFinalBalance: calculated,
      selectedFinalBalance: null,
      isValid: null,
      message: '⚠️ Final balance not selected. Calculated: ' + calculated.toFixed(2) + '€',
    };
  }

  // Allow for small floating point discrepancies
  const precision = 0.001; // e.g., 0.1 cent
  const difference = Math.abs(calculated - finalBalance.value);

  if (difference < precision) {
    return {
      calculatedFinalBalance: calculated,
      selectedFinalBalance: finalBalance.value,
      isValid: true,
      message: `✅ Valid! Calculated: ${calculated.toFixed(2)}€, Selected: ${finalBalance.value.toFixed(2)}€`,
    };
  } else {
    return {
      calculatedFinalBalance: calculated,
      selectedFinalBalance: finalBalance.value,
      isValid: false,
      message: `❌ Mismatch! Calculated: ${calculated.toFixed(2)}€, Selected: ${finalBalance.value.toFixed(2)}€ (Diff: ${difference.toFixed(2)}€)`,
    };
  }
}