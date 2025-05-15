// src/components/DataSummaryTable.tsx
import React from 'react';
import { Annotation } from '../types';
import { formatCurrency } from '../utils/numberUtils';

interface DataSummaryTableProps {
  annotations: Annotation[];
  legendColors: {
    startingBalance: string;
    credit: string;
    debit: string;
    finalBalance: string;
  };
}

const DataSummaryTable: React.FC<DataSummaryTableProps> = ({ annotations, legendColors }) => {
  // Calculate totals
  const totals = annotations.reduce((acc, annotation) => {
    if (annotation.type === 'startingBalance') {
      acc.startingBalance = annotation.value;
    } else if (annotation.type === 'credit') {
      acc.credit += annotation.value;
    } else if (annotation.type === 'debit') {
      acc.debit += annotation.value;
    } else if (annotation.type === 'finalBalance') {
      acc.finalBalance = annotation.value;
    }
    return acc;
  }, {
    startingBalance: 0,
    credit: 0,
    debit: 0,
    finalBalance: 0
  });

  return (
    <div className="mt-4">
      <table className="w-full border-collapse">
        <tbody>
          {/* Starting Balance Row */}
          <tr>
            <td 
              className="p-2 text-left font-medium"
              style={{ backgroundColor: `${legendColors.startingBalance}20` }}
            >
              Starting Balance
            </td>
            <td 
              className="p-2 text-right font-mono"
              style={{ backgroundColor: `${legendColors.startingBalance}20` }}
            >
              {formatCurrency(totals.startingBalance)}
            </td>
          </tr>

          {/* Credits and Debits Row */}
          <tr>
            <td 
              className="p-2 text-left font-medium"
              style={{ backgroundColor: `${legendColors.credit}20` }}
            >
              Credits
            </td>
            <td 
              className="p-2 text-right font-mono"
              style={{ backgroundColor: `${legendColors.credit}20` }}
            >
              {formatCurrency(totals.credit)}
            </td>
          </tr>
          <tr>
            <td 
              className="p-2 text-left font-medium"
              style={{ backgroundColor: `${legendColors.debit}20` }}
            >
              Debits
            </td>
            <td 
              className="p-2 text-right font-mono"
              style={{ backgroundColor: `${legendColors.debit}20` }}
            >
              {formatCurrency(totals.debit)}
            </td>
          </tr>

          {/* Final Balance Row */}
          <tr>
            <td 
              className="p-2 text-left font-medium"
              style={{ backgroundColor: `${legendColors.finalBalance}20` }}
            >
              Final Balance
            </td>
            <td 
              className="p-2 text-right font-mono"
              style={{ backgroundColor: `${legendColors.finalBalance}20` }}
            >
              {formatCurrency(totals.finalBalance)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DataSummaryTable;