// src/components/VerificationPanel.tsx
import React from "react";
import { useAnnotationStore } from "../features/annotations/annotationStore";

import { VerificationResult } from "../types";
import { formatCurrency } from "../utils/numberUtils";
import { verifyBalances } from "../features/verifications/verificationEngine";

const VerificationPanel: React.FC = () => {
  const getStartingBalance = useAnnotationStore(state => state.getStartingBalance);
  const getFinalBalance = useAnnotationStore(state => state.getFinalBalance);
  const getTotalCredits = useAnnotationStore(state => state.getTotalCredits);
  const getTotalDebits = useAnnotationStore(state => state.getTotalDebits);

  const startingBalance = getStartingBalance();
  const finalBalance = getFinalBalance();
  const totalCredits = getTotalCredits();
  const totalDebits = getTotalDebits();

  const result: VerificationResult = verifyBalances(
    startingBalance,
    finalBalance,
    totalCredits,
    totalDebits
  );

  const getResultColor = () => {
    if (result.isValid === true) return "text-green-600";
    if (result.isValid === false) return "text-red-600";
    return "text-yellow-600";
  };

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Verification</h3>
      <div className="space-y-2 text-sm">
        <p>
          Starting Balance:{" "}
          <span className="font-medium">
            {formatCurrency(startingBalance?.value)}
          </span>
        </p>
        <p>
          Total Credits:{" "}
          <span className="font-medium text-green-600">
            {formatCurrency(totalCredits)}
          </span>
        </p>
        <p>
          Total Debits:{" "}
          <span className="font-medium text-red-600">
            {formatCurrency(totalDebits)}
          </span>
        </p>
        <hr className="my-2" />
        <p>
          Calculated Final Balance:{" "}
          <span className="font-medium">
            {formatCurrency(result.calculatedFinalBalance)}
          </span>
        </p>
        <p>
          Selected Final Balance:{" "}
          <span className="font-medium">
            {formatCurrency(result.selectedFinalBalance)}
          </span>
        </p>
        <hr className="my-2" />
        <p className={`text-md font-bold ${getResultColor()}`}>
          {result.message}
        </p>
      </div>
    </div>
  );
};

export default VerificationPanel;
