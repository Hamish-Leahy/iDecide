import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  className = '' 
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-idecide-primary 
                 focus:outline-none focus:ring-2 focus:ring-idecide-primary focus:border-transparent
                 placeholder-gray-400"
      />
      <Search 
        size={20} 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-idecide-secondary"
      />
    </div>
  );
}