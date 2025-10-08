/**
 * Chart display component for rendering show_media tool outputs.
 */

import { parseShowMediaTool } from '@/lib/mix-streaming';
import { BarChart3 } from 'lucide-react';

interface ChartDisplayProps {
  tool: any;
}

export function ChartDisplay({ tool }: ChartDisplayProps) {
  const outputs = parseShowMediaTool(tool);

  if (outputs.length === 0) return null;

  return (
    <div className="space-y-4">
      {outputs.map((output, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800"
        >
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" style={{ color: 'var(--color-mix-primary)' }} />
            <h3 className="font-semibold text-gray-900 dark:text-white">{output.title}</h3>
          </div>

          <div className="p-6">
            {output.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{output.description}</p>
            )}

            {output.path && (
              <div className="bg-gray-50 dark:bg-gray-950 rounded-lg p-4">
                <img
                  src={output.path}
                  alt={output.title}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
