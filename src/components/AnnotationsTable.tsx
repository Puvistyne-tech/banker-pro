import React from 'react';
import { Annotation, AnnotationType } from '../types';

interface AnnotationsTableProps {
  groupedAnnotations: Record<AnnotationType, Annotation[]>;
  legendColors: Record<AnnotationType, string>;
}

export const AnnotationsTable: React.FC<AnnotationsTableProps> = ({
  groupedAnnotations,
  legendColors,
}) => {
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
              {(annotations as Annotation[]).map((annotation: Annotation, index: number) => (
                <tr 
                  key={`${type}-${index}`}
                  className="border-b border-gray-300"
                  style={{ backgroundColor: `${legendColors[annotation.type]}20` }}
                >
                  <td className="p-2">{annotation.type}</td>
                  <td className="p-2 text-right font-mono">{annotation.value.toFixed(2)}€</td>
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