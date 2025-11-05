'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MarkdownMessage from '@/app/components/MarkdownMessage';

interface Message {
  role: string;
  content: string;
  timestamp?: number;
}

interface Conversation {
  _id: string;
  conversation_id: string;
  random_id: string;
  title: string;
  default_model_slug?: string;
  created_at: string;
  updated_at: string;
  added_to_database: string;
  messages: Message[];
  message_count: number;
  source: 'chatgpt' | 'ollama';
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.conversations);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.conversation_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chatgptConvs = filteredConversations.filter((c) => c.source === 'chatgpt');
  const ollamaConvs = filteredConversations.filter((c) => c.source === 'ollama');

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const viewConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedConversation(data.conversation);
      }
    } catch {
      console.error('Failed to fetch conversation details');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
        <div className="text-center">
          <div className="flex gap-2 justify-center mb-4">
            <div className="w-3 h-3 bg-zinc-900 dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-zinc-900 dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-zinc-900 dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black p-4">
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
              Your Conversations
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              {conversations.length} total ({chatgptConvs.length} ChatGPT, {ollamaConvs.length} Ollama)
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/chat"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Ollama Chat
            </Link>
            <Link
              href="/"
              className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Upload More
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search conversations by title or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>

        {filteredConversations.length === 0 ? (
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-12 text-center border border-zinc-200 dark:border-zinc-700">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-zinc-600 dark:text-zinc-400">
              {searchTerm ? 'No conversations match your search' : 'No conversations found'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredConversations.map((conv) => (
              <div
                key={conv._id}
                className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={(e) => {
                e.preventDefault();
                window.location.href = `/conversations/${conv.conversation_id}`;
              }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {conv.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        conv.source === 'ollama' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {conv.source === 'ollama' ? 'Ollama' : 'ChatGPT'}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <span>💬 {conv.message_count} messages</span>
                      {conv.default_model_slug && <span>🤖 {conv.default_model_slug}</span>}
                      <span>📅 {formatDate(conv.created_at)}</span>
                    </div>
                  </div>
                  <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedConversation && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedConversation(null)}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  {selectedConversation.title}
                </h2>
                <div className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <span>
                    Source: 
                    <span className={`ml-1 px-2 py-0.5 rounded text-xs font-semibold ${
                      selectedConversation.source === 'ollama' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {selectedConversation.source === 'ollama' ? 'Ollama' : 'ChatGPT'}
                    </span>
                  </span>
                  {selectedConversation.default_model_slug && (
                    <span>Model: {selectedConversation.default_model_slug}</span>
                  )}
                  <span>Created: {formatDate(selectedConversation.created_at)}</span>
                  <span>Added to DB: {formatDate(selectedConversation.added_to_database)}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedConversation(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
                Messages ({selectedConversation.message_count})
              </h3>
              <div className="space-y-4">
                {selectedConversation.messages.map((message, index) => (
                  <div
                    key={index}
                    className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                        {message.role}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {message.timestamp ? formatDate(new Date(message.timestamp * 1000).toISOString()) : 'N/A'}
                      </span>
                    </div>
                    <div className="text-zinc-800 dark:text-zinc-200">
                      <MarkdownMessage content={message.content} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
