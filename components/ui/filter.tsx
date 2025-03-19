"use client";

import { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export function Filter({ title, options, selectedValues, onChange }: FilterProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [localSelectedValues, setLocalSelectedValues] = useState<string[]>(selectedValues);

  // Sync with parent component's state
  useEffect(() => {
    setLocalSelectedValues(selectedValues);
  }, [selectedValues]);

  const handleOptionChange = (value: string) => {
    const newValues = localSelectedValues.includes(value)
      ? localSelectedValues.filter((v) => v !== value)
      : [...localSelectedValues, value];
    
    setLocalSelectedValues(newValues);
    onChange(newValues);
  };

  const handleClearAll = () => {
    setLocalSelectedValues([]);
    onChange([]);
  };

  const handleSelectAll = () => {
    const allValues = options.map(option => option.value);
    setLocalSelectedValues(allValues);
    onChange(allValues);
  };

  return (
    <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
      <div 
        className="flex items-center justify-between cursor-pointer py-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">{title}</h3>
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} 
        />
      </div>
      
      {isExpanded && (
        <div className="mt-2">
          <div className="flex justify-between items-center mb-2 text-xs">
            <button 
              className="text-blue-600 dark:text-blue-400 hover:underline" 
              onClick={handleSelectAll}
            >
              Select all
            </button>
            <button 
              className="text-gray-500 dark:text-gray-400 hover:underline" 
              onClick={handleClearAll}
            >
              Clear
            </button>
          </div>
          
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {options.map((option) => (
              <div 
                key={option.value} 
                className="flex items-center"
              >
                <div 
                  onClick={() => handleOptionChange(option.value)}
                  className="flex items-center cursor-pointer py-1"
                >
                  <div className={`
                    w-4 h-4 border rounded mr-2 flex items-center justify-center
                    ${localSelectedValues.includes(option.value) 
                      ? 'bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600' 
                      : 'border-gray-300 dark:border-gray-600'}
                  `}>
                    {localSelectedValues.includes(option.value) && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                </div>
                {option.count !== undefined && (
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                    {option.count}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
