import React, { useState, useEffect } from 'react';
import { RefreshCw, Check } from 'lucide-react';

interface SpreadsheetInputProps {
  value: string;
  placeholder?: string;
  onSave: (newValue: string) => void;
  status: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
}

export function SpreadsheetInput({ value, placeholder, onSave, status, className }: SpreadsheetInputProps) {
  const [localVal, setLocalVal] = useState(value);

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const handleBlur = () => {
    if (localVal !== value) {
      onSave(localVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`${className} pr-7`}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
        {status === 'saving' && (
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
        )}
        {status === 'saved' && (
          <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        )}
        {status === 'error' && (
          <span className="text-[10px] text-rose-500 font-bold font-sans">!</span>
        )}
      </div>
    </div>
  );
}

interface SpreadsheetSelectProps {
  value: string;
  options: { value: string; label: string }[];
  onSave: (newValue: string) => void;
  status: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
}

export function SpreadsheetSelect({ value, options, onSave, status, className }: SpreadsheetSelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSave(e.target.value);
  };

  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={handleChange}
        className={`${className} pr-7 cursor-pointer`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
        {status === 'saving' && (
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
        )}
        {status === 'saved' && (
          <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        )}
        {status === 'error' && (
          <span className="text-[10px] text-rose-500 font-bold">!</span>
        )}
      </div>
    </div>
  );
}
