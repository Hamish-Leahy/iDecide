import { useState, useMemo } from 'react';

export function useSearch<T>(
  items: T[],
  searchFields: (keyof T)[],
  options?: {
    minSearchLength?: number;
    caseSensitive?: boolean;
  }
) {
  const [searchTerm, setSearchTerm] = useState('');
  const { minSearchLength = 2, caseSensitive = false } = options || {};

  const filteredItems = useMemo(() => {
    if (!searchTerm || searchTerm.length < minSearchLength) {
      return items;
    }

    const searchValue = caseSensitive ? searchTerm : searchTerm.toLowerCase();

    return items.filter(item => {
      return searchFields.some(field => {
        const fieldValue = String(item[field]);
        return caseSensitive
          ? fieldValue.includes(searchValue)
          : fieldValue.toLowerCase().includes(searchValue);
      });
    });
  }, [items, searchTerm, searchFields, minSearchLength, caseSensitive]);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
  };
}