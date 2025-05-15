// src/components/Legend.tsx
import React from "react";
import { AmountType } from "../types";

// Color picker component
const ColorPicker = ({ color, onChange }: { color: string, onChange: (color: string) => void }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-white/20 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200">
          <input
            type="color"
            value={color}
            onChange={(e) => {
              onChange(e.target.value);
              setIsOpen(false);
            }}
            className="w-32 h-32 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};

interface LegendProps {
  legendColors: Record<AmountType, string>;
  selectedType: AmountType;
  onTypeSelect: (type: AmountType) => void;
  onColorChange: (type: AmountType, color: string) => void;
  clearAnnotations: () => void;
}

const Legend: React.FC<LegendProps> = ({ 
  legendColors, 
  selectedType, 
  onTypeSelect, 
  onColorChange,
  clearAnnotations 
}) => {
  const getLegendStyle = (type: AmountType) => {
    const isSelected = selectedType === type;
    const color = legendColors[type];
    return {
      backgroundColor: color + (isSelected ? "" : "40"), // 40 is 25% opacity
      color: isSelected ? "white" : "black",
      border: isSelected ? `2px solid ${color}` : "none",
    };
  };

  return (
    <div className="p-2 border-b border-gray-200">
      <div className="flex flex-wrap gap-1">
        {[
          { type: "startingBalance", label: "Starting Balance" },
          { type: "credit", label: "Credit" },
          { type: "debit", label: "Debit" },
          { type: "finalBalance", label: "Final Balance" },
        ].map((option) => (
          <div
            key={option.type}
            style={getLegendStyle(option.type as AmountType)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all flex-shrink-0"
          >
            <button
              onClick={() => onTypeSelect(option.type as AmountType)}
              className="flex-1 text-left whitespace-nowrap"
            >
              {option.label}
            </button>
            <ColorPicker
              color={legendColors[option.type as AmountType]}
              onChange={(color) => onColorChange(option.type as AmountType, color)}
            />
          </div>
        ))}
        {/* Eraser Button */}
        <button
          onClick={() => onTypeSelect("eraser")}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all flex-shrink-0 ${
            selectedType === "eraser"
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
          </svg>
          Eraser
        </button>
        {/* Reset Button */}
        <button
          onClick={() => {
            clearAnnotations();
            onTypeSelect("credit");
          }}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all flex-shrink-0 bg-red-100 text-red-600 hover:bg-red-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Reset All
        </button>
      </div>
    </div>
  );
};

export default Legend;
