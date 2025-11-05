'use client';

import { useState, useRef, useEffect } from 'react';
import MarkdownMessage from '@/app/components/MarkdownMessage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  responseTime?: number;
  tokensPerSecond?: number;
}

export default function LMStudioPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [saved, setSaved] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/lmstudio/models');
      const data = await response.json();
      
      if (data.success && data.models.length > 0) {
        setAvailableModels(data.models);
        setModel(data.models[0]);
      } else {
        setAvailableModels(['default']);
        setModel('default');
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
      setAvailableModels(['default']);
      setModel('default');
    } finally {
      setLoadingModels(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !model) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/lmstudio/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message.content,
          timestamp: Date.now(),
          responseTime: data.responseTime,
          tokensPerSecond: data.tokensPerSecond,
        };
        const updatedMessages = [...messages, userMessage, assistantMessage];
        setMessages(updatedMessages);
        
        await saveConversation(updatedMessages);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const saveConversation = async (messageList: Message[]) => {
    if (messageList.length === 0) return;

    try {
      const title = messageList[0]?.content.substring(0, 50) || 'LM Studio Chat';
      
      const response = await fetch('/api/lmstudio/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          messages: messageList.map((m) => ({
            role: m.role,
            content: m.content,
            timestamp: Math.floor(m.timestamp / 1000),
          })),
          model,
          conversationId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (!conversationId) {
          setConversationId(data.conversation_id);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };

  const clearChat = () => {
    if (messages.length > 0 && confirm('Start a new chat? Current conversation is already saved.')) {
      setMessages([]);
      setSaved(false);
      setConversationId(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              LM Studio Chat
            </h1>
            {loadingModels ? (
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Loading models...
              </div>
            ) : availableModels.length === 0 ? (
              <div className="text-sm text-red-600 dark:text-red-400">
                No models found
              </div>
            ) : (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {model}
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {saved && (
              <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <span>✓</span>
                <span>Auto-saved</span>
              </div>
            )}
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                New Chat
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🖥️</div>
              <p className="text-zinc-600 dark:text-zinc-400">
                Start a conversation with LM Studio
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
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
                  <div className="text-xs font-semibold mb-3 opacity-70 uppercase">
                    {message.role}
                  </div>
                  <div className="break-words">
                    <MarkdownMessage content={message.content} />
                  </div>
                  <div
                    className={`text-xs mt-3 flex flex-wrap gap-3 opacity-60`}
                  >
                    <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                    {message.responseTime && (
                      <span>⏱️ {message.responseTime}s</span>
                    )}
                    {message.tokensPerSecond && (
                      <span>⚡ {message.tokensPerSecond} t/s</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex flex-col gap-2 flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={loadingModels}
                className="px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 min-w-[140px]"
              >
                {loadingModels ? (
                  <option>Loading...</option>
                ) : availableModels.length === 0 ? (
                  <option>No models</option>
                ) : (
                  availableModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))
                )}
              </select>
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim() || !model || loadingModels}
                className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
