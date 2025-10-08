import { Upload } from 'lucide-react';
import { useCallback, useState } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export function FileUploader({ onFileSelect }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
          onFileSelect(file);
        } else {
          alert('Please upload a CSV file');
        }
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
        isDragging
          ? 'border-[var(--color-mix-primary)] bg-[color-mix(in_srgb,var(--color-mix-primary)_5%,transparent)]'
          : 'border-gray-300 dark:border-gray-700 hover:border-[var(--color-mix-primary)] hover:bg-[color-mix(in_srgb,var(--color-mix-primary)_2%,transparent)]'
      }`}
    >
      <input
        type="file"
        accept=".csv"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      <div className="pointer-events-none">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-mix-primary) 10%, transparent)',
          }}
        >
          <Upload className="w-8 h-8" style={{ color: 'var(--color-mix-primary)' }} />
        </div>

        <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Drop your CSV file here
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          or click to browse
        </p>
      </div>
    </div>
  );
}
