/**
 * Streaming chat component that displays real-time AI responses.
 */

import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { ChartDisplay } from '@/components/ChartDisplay';

interface StreamingChatProps {
  sessionId: string;
  message: string;
  onComplete?: () => void;
}

export function StreamingChat({ sessionId, message, onComplete }: StreamingChatProps) {
  const [content, setContent] = useState('');
  const [thinking, setThinking] = useState('');
  const [tools, setTools] = useState<any[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentEndRef = useRef<HTMLDivElement>(null);
  const isCompleteRef = useRef(false);

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/stream/${sessionId}?message=${encodeURIComponent(message)}`
    );

    eventSource.addEventListener('thinking', (e) => {
      const data = JSON.parse(e.data);
      setThinking(data.content || '');
    });

    eventSource.addEventListener('content', (e) => {
      const data = JSON.parse(e.data);
      setContent((prev) => prev + (data.content || ''));
      setThinking('');
    });

    eventSource.addEventListener('tool', (e) => {
      const data = JSON.parse(e.data);
      setTools((prev) => [...prev, data]);
    });

    eventSource.addEventListener('error', (e) => {
      const data = JSON.parse(e.data);
      setError(data.error || 'An error occurred');
      eventSource.close();
    });

    eventSource.addEventListener('complete', () => {
      isCompleteRef.current = true;
      setIsComplete(true);
      eventSource.close();
      onComplete?.();
    });

    eventSource.onerror = () => {
      if (!isCompleteRef.current) {
        setError('Connection error');
      }
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId, message]);

  useEffect(() => {
    contentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [content, thinking]);

  return (
    <div className="space-y-8">
      {/* AI Response */}
      {content && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-mix-primary)' }}>
            Analysis
          </h3>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-900 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {content}
            </p>
          </div>
        </div>
      )}

      {/* Thinking Indicator */}
      {thinking && !isComplete && (
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="italic">{thinking}</span>
        </div>
      )}

      {/* Charts/Media from show_media tool */}
      {tools.length > 0 && (
        <div className="space-y-6 mt-8">
          {tools.map((tool, index) => (
            <ChartDisplay key={index} tool={tool} />
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading Indicator */}
      {!isComplete && !error && !content && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-mix-primary)' }} />
        </div>
      )}

      <div ref={contentEndRef} />
    </div>
  );
}
