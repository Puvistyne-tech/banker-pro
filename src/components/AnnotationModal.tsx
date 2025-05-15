// src/components/AnnotationModal.tsx
import React, { useState, useEffect } from 'react';
import { AnnotationType } from '../types';
import { parseFrenchCurrency } from '../utils/numberUtils';

interface AnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (type: AnnotationType, value: number, rawValue: string) => void;
  suggestedText?: string;
  pdfUrl?: string;
}

interface TableRow {
  id: string;
  type: AnnotationType;
  amount: number;
  rawValue: string;
  color: string;
}

const AnnotationModal: React.FC<AnnotationModalProps> = ({ isOpen, onClose, onSave, suggestedText, pdfUrl }) => {
  const [selectedType, setSelectedType] = useState<AnnotationType>('credit');
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [, setError] = useState<string | null>(null);

  const typeOptions = [
    { value: 'startingBalance', label: 'Starting Balance', color: 'bg-blue-500/30', textColor: 'text-blue-800' },
    { value: 'credit', label: 'Credit', color: 'bg-green-500/30', textColor: 'text-green-800' },
    { value: 'debit', label: 'Debit', color: 'bg-red-500/30', textColor: 'text-red-800' },
    { value: 'finalBalance', label: 'Final Balance', color: 'bg-purple-500/30', textColor: 'text-purple-800' },
  ];

  useEffect(() => {
    if (suggestedText) {
      try {
        const parsed = parseFrenchCurrency(suggestedText);
        if (parsed !== null) {
          const newRow: TableRow = {
            id: Date.now().toString(),
            type: selectedType,
            amount: parsed,
            rawValue: suggestedText,
            color: typeOptions.find(opt => opt.value === selectedType)?.color || 'bg-gray-500/30'
          };
          setTableData(prev => [...prev, newRow]);
          setError(null);
        } else {
          setError('Invalid number format');
        }
      } catch (e) {
        setError('Invalid number format');
      }
    }
  }, [suggestedText, selectedType]);

  const calculateFinalBalance = () => {
    let balance = 0;
    tableData.forEach(row => {
      switch (row.type) {
        case 'startingBalance':
        case 'credit':
          balance += row.amount;
          break;
        case 'debit':
          balance -= row.amount;
          break;
        case 'finalBalance':
          balance = row.amount;
          break;
      }
    });
    return balance;
  };

  const handleTypeChange = (rowId: string, newType: AnnotationType) => {
    setTableData(prev => prev.map(row => 
      row.id === rowId 
        ? { 
            ...row, 
            type: newType,
            color: typeOptions.find(opt => opt.value === newType)?.color || 'bg-gray-500/30'
          }
        : row
    ));
  };

  const handleDelete = (rowId: string) => {
    setTableData(prev => prev.filter(row => row.id !== rowId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[90vw] h-[90vh] flex">
        {/* Left side - PDF */}
        <div className="w-1/2 p-4 border-r border-gray-200">
          <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
            {pdfUrl ? (
              <iframe src={pdfUrl} className="w-full h-full rounded-lg" />
            ) : (
              <p className="text-gray-500">PDF will be displayed here</p>
            )}
          </div>
        </div>

        {/* Right side - Table and Controls */}
        <div className="w-1/2 flex flex-col">
          {/* Color Legend */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Selection Types:</h3>
            <div className="flex gap-2">
              {typeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedType(option.value as AnnotationType)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    selectedType === option.value
                      ? `${option.color} ${option.textColor} ring-2 ring-offset-2 ring-current`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto p-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-left text-sm font-medium text-gray-500">Type</th>
                  <th className="p-2 text-right text-sm font-medium text-gray-500">Amount</th>
                  <th className="p-2 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map(row => (
                  <tr key={row.id} className={`border-b border-gray-200 ${row.color}`}>
                    <td className="p-2">
                      <select
                        value={row.type}
                        onChange={(e) => handleTypeChange(row.id, e.target.value as AnnotationType)}
                        className="bg-transparent border-none focus:ring-0"
                      >
                        {typeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 text-right font-mono">{row.amount.toFixed(2)}€</td>
                    <td className="p-2 text-right">
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-medium">
                  <td className="p-2">Final Balance</td>
                  <td className="p-2 text-right font-mono">{calculateFinalBalance().toFixed(2)}€</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Save all annotations
                tableData.forEach(row => {
                  onSave(row.type, row.amount, row.rawValue);
                });
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Save All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationModal;