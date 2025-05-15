// src/components/VerificationPanel.tsx
import React, { useState } from "react";
import { useAnnotationStore } from "../features/annotations/annotationStore";

import { VerificationResult } from "../types";
import { formatCurrency } from "../utils/numberUtils";
import { verifyBalances } from "../features/verifications/verificationEngine";

const VerificationPanel: React.FC = () => {
  const [showModificationHint, setShowModificationHint] = useState(false);
  const getStartingBalance = useAnnotationStore(state => state.getStartingBalance);
  const getFinalBalance = useAnnotationStore(state => state.getFinalBalance);
  const getTotalCredits = useAnnotationStore(state => state.getTotalCredits);
  const getTotalDebits = useAnnotationStore(state => state.getTotalDebits);
  // const getVirtualTableEntries = useAnnotationStore(state => state.getVirtualTableEntries);
  // const updateAnnotation = useAnnotationStore(state => state.updateAnnotation);

  const startingBalance = getStartingBalance();
  const finalBalance = getFinalBalance();
  const totalCredits = getTotalCredits();
  const totalDebits = getTotalDebits();
  // const tableEntries = getVirtualTableEntries();

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

  // const handleModifyEntry = (id: string, newValue: number) => {
  //   updateAnnotation(id, { value: newValue });
  // };

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
        
        {result.isValid === false && (
          <div className="mt-4">
            <button
              onClick={() => setShowModificationHint(!showModificationHint)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showModificationHint ? "Hide" : "Show"} Modification Help
            </button>
            
            {showModificationHint && (
              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800 mb-2">
                  To fix the balance mismatch, you can modify any entry in the table:
                </p>
                <ul className="list-disc list-inside text-sm text-blue-800">
                  <li>Click on any amount in the table to edit it</li>
                  <li>The difference is {formatCurrency(Math.abs(result.calculatedFinalBalance - (result.selectedFinalBalance || 0)))}</li>
                  <li>Adjust any credit or debit entry to match the final balance</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPanel;
