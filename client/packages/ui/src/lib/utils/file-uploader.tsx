'use client';

import { cn } from '@healthalst/ui/lib/utils';
import { Icon } from './icons/icon';
import { Button } from '@healthalst/ui/components/button';
import { formatFileSize } from '@healthalst/ui/lib/utils';
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';

interface FileUploaderProps {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  className?: string;
}

function FileUploader({
  accept,
  maxSize,
  multiple = false,
  onFilesSelected,
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;

    const fileArray = Array.from(files).filter((f) => {
      return !(maxSize && f.size > maxSize);
    });

    setSelectedFiles(multiple ? [...selectedFiles, ...fileArray] : fileArray);
    onFilesSelected(fileArray);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      data-slot="file-uploader"
      className={cn('flex flex-col gap-3', className)}
    >
      <div
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
          isDragging
            ? 'border-primary bg-primary-subtle'
            : 'border-border hover:border-foreground-muted/50'
        )}
      >
        <Icon name="UploadCloud" size={32} className="text-foreground-muted" />
        <p className="text-sm text-foreground-muted">
          Drag & drop files here, or click to browse
        </p>
        {maxSize && (
          <p className="text-xs text-foreground-muted">
            Max file size: {formatFileSize(maxSize)}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {selectedFiles.length > 0 && (
        <ul className="flex flex-col gap-2">
          {selectedFiles.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-md bg-surface-subtle px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 truncate">
                <Icon
                  name="FileText"
                  size={16}
                  className="shrink-0 text-foreground-muted"
                />
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-xs text-foreground-muted">
                  {formatFileSize(file.size)}
                </span>
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-7 shrink-0"
                aria-label={`Remove ${file.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <Icon name="X" size={14} />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { FileUploader, type FileUploaderProps };
