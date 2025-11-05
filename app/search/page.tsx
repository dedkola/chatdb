'use client';

import { useState } from 'react';
import Link from 'next/link';
import MarkdownMessage from '@/app/components/MarkdownMessage';

interface SearchResult {
  conversation_id: string;
  title: string;
  source: string;
  matchedMessage: string;
  messageIndex: number;
  created_at?: string;
  updated_at?: string;
}

export default function SearchPage() {
  const [searchText, setSearchText] = useState('');
  const [collection, setCollection] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const collections = [
    { value: 'all', label: 'All Collections' },
    { value: 'chatgpt', label: 'ChatGPT' },
    { value: 'ollama', label: 'Ollama' },
    { value: 'lmstudio', label: 'LM Studio' },
  ];

  const handleSearch = async () => {
    if (!searchText.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchText,
          collection: collection,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
      } else {
        console.error('Search failed:', data.error);
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-600 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-700">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">
            🔍 Search Conversations
          </h1>

          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for text in messages..."
                className="flex-1 px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              />
              <select
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                className="px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 min-w-[160px]"
              >
                {collections.map((col) => (
                  <option key={col.value} value={col.value}>
                    {col.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSearch}
                disabled={loading || !searchText.trim()}
                className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {searched && (
          <div className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-white"></div>
                <p className="mt-4 text-zinc-600 dark:text-zinc-400">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-700 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-zinc-600 dark:text-zinc-400">
                  No results found for &quot;{searchText}&quot;
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Found {results.length} result{results.length !== 1 ? 's' : ''}
                </div>
                {results.map((result, index) => (
                  <Link
                    key={index}
                    href={`/conversations/${result.conversation_id}`}
                    className="block bg-white dark:bg-zinc-800 rounded-xl shadow-md p-6 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {result.title}
                      </h3>
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                        {result.source}
                      </span>
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                      <div className="line-clamp-4 overflow-hidden">
                        <MarkdownMessage content={result.matchedMessage} />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-500">
                      {result.updated_at && (
                        <span>
                          Updated: {new Date(result.updated_at).toLocaleDateString()}
                        </span>
                      )}
                      <span>Message #{result.messageIndex + 1}</span>
                      <span className="ml-auto text-zinc-400 dark:text-zinc-600">
                        Click to view conversation →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
