// src/components/DataSummaryTable.tsx
import React, { useState } from 'react';
import { Amount, AmountType } from '../types';
import { formatCurrency } from '../utils/numberUtils';
import { useAnnotationStore } from '../features/annotations/annotationStore';

type ValidAnnotationType = Exclude<AmountType, 'eraser'>;

interface DataSummaryTableProps {
  annotations: Amount[];
  legendColors: Record<ValidAnnotationType, string>;
}

const DataSummaryTable: React.FC<DataSummaryTableProps> = ({ 
  annotations, 
  legendColors,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const updateAnnotation = useAnnotationStore(state => state.updateAnnotation);

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

  // Calculate expected final balance
  const calculatedFinalBalance = totals.startingBalance + totals.credit - totals.debit;

  const handleEdit = (type: ValidAnnotationType, value: number) => {
    const annotation = annotations.find(a => a.type === type);
    if (annotation) {
      setEditingId(annotation.id);
      setEditValue(value.toString());
    }
  };

  const handleSave = (id: string) => {
    const newValue = parseFloat(editValue);
    if (!isNaN(newValue)) {
      updateAnnotation(id, { value: newValue });
    }
    setEditingId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSave(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const renderEditableCell = (type: ValidAnnotationType, value: number) => {
    const annotation = annotations.find(a => a.type === type);
    if (!annotation) return null;

    if (editingId === annotation.id) {
      return (
        <div className="flex items-center justify-end gap-2">
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleSave(annotation.id)}
            onKeyDown={(e) => handleKeyPress(e, annotation.id)}
            className="w-32 p-1 text-right font-mono bg-white border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={() => handleSave(annotation.id)}
            className="px-2 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      );
    }
    return (
      <div 
        onDoubleClick={() => handleEdit(type, value)}
        className="p-2 text-right font-mono cursor-pointer hover:bg-gray-100 rounded"
      >
        {formatCurrency(value)}
      </div>
    );
  };

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
              style={{ backgroundColor: `${legendColors.startingBalance}20` }}
            >
              {renderEditableCell('startingBalance', totals.startingBalance)}
            </td>
          </tr>

          {/* Credits Row */}
          <tr>
            <td 
              className="p-2 text-left font-medium"
              style={{ backgroundColor: `${legendColors.credit}20` }}
            >
              Total Credits
            </td>
            <td 
              style={{ backgroundColor: `${legendColors.credit}20` }}
            >
              {renderEditableCell('credit', totals.credit)}
            </td>
          </tr>

          {/* Debits Row */}
          <tr>
            <td 
              className="p-2 text-left font-medium"
              style={{ backgroundColor: `${legendColors.debit}20` }}
            >
              Total Debits
            </td>
            <td 
              style={{ backgroundColor: `${legendColors.debit}20` }}
            >
              {renderEditableCell('debit', totals.debit)}
            </td>
          </tr>

          {/* Calculated Final Balance Row */}
          <tr>
            <td 
              className="p-2 text-left font-medium"
              style={{ backgroundColor: `${legendColors.finalBalance}20` }}
            >
              Calculated Final Balance
            </td>
            <td 
              style={{ backgroundColor: `${legendColors.finalBalance}20` }}
              className="p-2 text-right font-mono"
            >
              {formatCurrency(calculatedFinalBalance)}
            </td>
          </tr>

          {/* Selected Final Balance Row */}
          <tr>
            <td 
              className="p-2 text-left font-medium"
              style={{ backgroundColor: `${legendColors.finalBalance}20` }}
            >
              Selected Final Balance
            </td>
            <td 
              style={{ backgroundColor: `${legendColors.finalBalance}20` }}
            >
              {renderEditableCell('finalBalance', totals.finalBalance)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DataSummaryTable;