'use client';

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  text: string;
  line: number;
  index: number;
  context: string;
}

interface DocumentSearchProps {
  content: string;
  onSearch: (query: string) => void;
}

export function DocumentSearch({ content, onSearch }: DocumentSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isRegex, setIsRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    onSearch(debouncedQuery);
    
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    let searchRegex: RegExp;
    try {
      if (isRegex) {
        searchRegex = new RegExp(debouncedQuery, caseSensitive ? 'g' : 'gi');
      } else {
        searchRegex = new RegExp(
          debouncedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          caseSensitive ? 'g' : 'gi'
        );
      }

      const lines = content.split('\n');
      const matches: SearchResult[] = [];

      lines.forEach((line, lineNum) => {
        let match;
        while ((match = searchRegex.exec(line)) !== null) {
          matches.push({
            text: match[0],
            line: lineNum + 1,
            index: match.index,
            context: getContext(line, match.index)
          });
        }
      });

      setResults(matches);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    }
  }, [debouncedQuery, content, isRegex, caseSensitive, onSearch]);

  const getContext = (line: string, index: number, contextLength = 40) => {
    const start = Math.max(0, index - contextLength);
    const end = Math.min(line.length, index + contextLength);
    return line.slice(start, end);
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search in document..."
          className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
        <button
          onClick={() => setIsRegex(!isRegex)}
          className={`px-3 py-1 rounded-lg ${
            isRegex ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'
          }`}
          title="Regular Expression"
        >
          .*
        </button>
        <button
          onClick={() => setCaseSensitive(!caseSensitive)}
          className={`px-3 py-1 rounded-lg ${
            caseSensitive ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'
          }`}
          title="Case Sensitive"
        >
          Aa
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-2 space-y-2">
          {results.map((result, index) => (
            <div
              key={`${result.line}-${result.index}`}
              className={`p-2 rounded ${
                selectedIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onClick={() => setSelectedIndex(index)}
            >
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Line {result.line}
              </div>
              <div className="text-sm">
                ...{result.context}...
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 