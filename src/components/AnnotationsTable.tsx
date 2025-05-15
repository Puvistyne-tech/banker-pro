import React, { useState } from 'react';
import { Amount, AmountType } from '../types';
import { useAnnotationStore } from '../features/annotations/annotationStore';
import { formatCurrency } from '../utils/numberUtils';

interface AnnotationsTableProps {
  groupedAnnotations: Record<AmountType, Amount[]>;
  legendColors: Record<AmountType, string>;
}

export const AnnotationsTable: React.FC<AnnotationsTableProps> = ({
  groupedAnnotations,
  legendColors,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const updateAnnotation = useAnnotationStore(state => state.updateAnnotation);

  const handleEdit = (annotation: Amount) => {
    setEditingId(annotation.id);
    setEditValue(annotation.value.toString());
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

  const renderEditableCell = (annotation: Amount) => {
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
        onDoubleClick={() => handleEdit(annotation)}
        className="p-2 text-right font-mono cursor-pointer hover:bg-gray-100 rounded"
      >
        {formatCurrency(annotation.value)}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <table className="w-full">
        <thead>
          <tr>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-right">Amount</th>
            <th className="p-2 text-right">Page</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedAnnotations).map(([type, annotations]) => (
            <React.Fragment key={type}>
              {(annotations as Amount[]).map((annotation: Amount, index: number) => (
                <tr 
                  key={`${type}-${index}`}
                  className="border-b border-gray-300"
                  style={{ backgroundColor: `${legendColors[annotation.type]}20` }}
                >
                  <td className="p-2">{annotation.type}</td>
                  <td className="p-2">
                    {renderEditableCell(annotation)}
                  </td>
                  <td className="p-2 text-right">{annotation.pageNumber}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 