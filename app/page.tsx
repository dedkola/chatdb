'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    inserted?: number;
    modified?: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload file',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black p-4">
      <main className="w-full max-w-2xl">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-700">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
              ChatGPT Data Uploader
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Upload your exported ChatGPT conversations to MongoDB Atlas
            </p>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl p-12 text-center hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors cursor-pointer"
          >
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="space-y-4">
                <div className="text-6xl">📁</div>
                <div>
                  <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                    {file ? file.name : 'Drop your JSON file here'}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                    or click to browse
                  </p>
                </div>
              </div>
            </label>
          </div>

          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full mt-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 px-6 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload to MongoDB'}
            </button>
          )}

          {result && (
            <div
              className={`mt-6 p-4 rounded-lg ${
                result.success
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-start">
                <span className="text-2xl mr-3">
                  {result.success ? '✅' : '❌'}
                </span>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      result.success
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-red-800 dark:text-red-200'
                    }`}
                  >
                    {result.success ? 'Success!' : 'Error'}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      result.success
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}
                  >
                    {result.message || result.error}
                  </p>
                  {result.success && (
                    <div className="text-xs mt-2 text-green-600 dark:text-green-400">
                      Inserted: {result.inserted} | Modified: {result.modified}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
              How to export your ChatGPT data:
            </h2>
            <ol className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>1. Go to ChatGPT Settings → Data Controls</li>
              <li>2. Click &quot;Export data&quot;</li>
              <li>3. Wait for the email with your data</li>
              <li>4. Extract and upload the conversations.json file</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
