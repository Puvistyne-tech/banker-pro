import React, { useState, useCallback } from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  color, 
  onChange, 
  label = 'Pick a color',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(false);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  return (
    <div className={`relative ${className}`} onKeyDown={handleKeyDown}>
      <button
        onClick={handleToggle}
        className="p-1 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={label}
        aria-expanded={isOpen}
        aria-controls="color-picker-popup"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4" 
          viewBox="0 0 20 20" 
          fill="currentColor"
          aria-hidden="true"
        >
          <path 
            fillRule="evenodd" 
            d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>
      {isOpen && (
        <div 
          id="color-picker-popup"
          className="absolute z-50 mt-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
          role="dialog"
          aria-label="Color picker"
        >
          <input
            type="color"
            value={color}
            onChange={handleChange}
            className="w-32 h-32 cursor-pointer"
            aria-label="Color input"
          />
        </div>
      )}
    </div>
  );
}; 