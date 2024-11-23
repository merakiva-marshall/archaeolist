'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function IndexNowTest() {
  const [urls, setUrls] = useState('');
  const [origin, setOrigin] = useState('');
  const [status, setStatus] = useState<{
    loading: boolean;
    message?: string;
    error?: boolean;
  }>({ loading: false });

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true });

    try {
      const urlList = urls.split('\n').map(url => url.trim()).filter(Boolean);

      // Validate URLs
      const siteHostname = new URL(origin).hostname;
      const invalidUrls = urlList.filter(url => {
        try {
          const urlHostname = new URL(url).hostname;
          return urlHostname !== siteHostname;
        } catch {
          return true; // Invalid URL format
        }
      });

      if (invalidUrls.length > 0) {
        throw new Error(`Invalid URLs detected. URLs must belong to ${siteHostname}`);
      }
      
      const response = await fetch('/api/indexnow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: urlList })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit URLs');
      }

      setStatus({
        loading: false,
        message: `URLs submitted successfully! ${
          data.statusCode === 200 
            ? `(API Status: ${data.statusCode}, Response: ${data.response})`
            : data.message || ''
        }`,
        error: false
      });
    } catch (error) {
      setStatus({
        loading: false,
        message: `Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`,
        error: true
      });
    }
  };

  if (!origin) {
    return null; // Or loading state
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">IndexNow Test Tool</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Enter URLs (one per line)
          </label>
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            className="w-full h-40 p-3 border rounded-md"
            placeholder={`${origin}/sites/greece/acropolis\n${origin}/sites/egypt/giza`}
          />
        </div>
        
        <button
          type="submit"
          disabled={status.loading || !urls.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {status.loading ? (
            <span className="flex items-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </span>
          ) : (
            'Submit URLs'
          )}
        </button>
      </form>

      {status.message && (
        <div className={`mt-4 p-4 rounded-md ${
          status.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          <div className="flex items-center">
            {status.error ? (
              <AlertCircle className="w-5 h-5 mr-2" />
            ) : (
              <CheckCircle2 className="w-5 h-5 mr-2" />
            )}
            {status.message}
          </div>
        </div>
      )}

      <div className="mt-8 text-sm text-gray-600">
        <h2 className="font-medium mb-2">Verification Steps:</h2>
        <ol className="list-decimal pl-4 space-y-2">
          <li>Submit a few test URLs using the form above</li>
          <li>Check the browser console for detailed API responses</li>
          <li>Verify your key file at: <code className="bg-gray-100 px-2 py-1 rounded">{origin}/{'{INDEXNOW_KEY}'}.txt</code></li>
          <li>Check Bing Webmaster Tools submissions page after a few minutes</li>
        </ol>
      </div>
    </div>
  );
}