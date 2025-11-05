'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import MarkdownMessage from '@/app/components/MarkdownMessage';

interface Message {
  role: string;
  content: string;
  timestamp?: number;
}

interface Conversation {
  conversation_id: string;
  title: string;
  source: string;
  default_model_slug?: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
  message_count: number;
}

function MessageBubble({ message }: { message: Message }) {
  return (
    <div
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-4 ${
          message.role === 'user'
            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
            : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white'
        }`}
      >
        <div className="text-xs font-semibold mb-2 opacity-70 uppercase">
          {message.role}
        </div>
        <div className="break-words">
          <MarkdownMessage content={message.content} />
        </div>
        {message.timestamp && (
          <div className="text-xs mt-3 opacity-60">
            {new Date(message.timestamp * 1000).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversation();
  }, [resolvedParams.id]);

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        setConversation(data.conversation);
      } else {
        setError(data.error || 'Failed to load conversation');
      }
    } catch (err) {
      setError('Failed to fetch conversation');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-white mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-700 max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            Conversation Not Found
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            {error || 'The conversation you are looking for does not exist.'}
          </p>
          <Link
            href="/conversations"
            className="inline-block px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            Back to All Conversations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/conversations"
            className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            ← Back to All Conversations
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {conversation.title}
              </h1>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                {conversation.source}
              </span>
            </div>
            <div className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              {conversation.default_model_slug && (
                <span>Model: {conversation.default_model_slug}</span>
              )}
              <span>{conversation.message_count} messages</span>
              <span>
                Updated: {new Date(conversation.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="p-8 space-y-6 max-h-[calc(100vh-20rem)] overflow-y-auto">
            {conversation.messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
