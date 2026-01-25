'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, File, X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Maximum file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  accept?: string;
  label?: string;
  currentUrl?: string;
  maxSizeMB?: number;
}

const getFileNameFromUrl = (url: string) => {
  try {
    const decodedUrl = decodeURIComponent(url);
    const parts = decodedUrl.split('/');
    const fileNameWithHash = parts[parts.length - 1];
    return fileNameWithHash;
  } catch (e) {
    return 'Existing File';
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatSpeed = (bytesPerSecond: number): string => {
  if (bytesPerSecond < 1024) return bytesPerSecond.toFixed(0) + ' B/s';
  if (bytesPerSecond < 1024 * 1024) return (bytesPerSecond / 1024).toFixed(1) + ' KB/s';
  return (bytesPerSecond / (1024 * 1024)).toFixed(1) + ' MB/s';
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  accept = '.pdf,.doc,.docx,.txt,.pptx,.xlsx,.mp4,.zip',
  label = 'Upload Document',
  currentUrl,
  maxSizeMB = 100
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(currentUrl || null);
  const [fileName, setFileName] = useState<string | null>(currentUrl ? getFileNameFromUrl(currentUrl) : null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastLoadedRef = useRef<number>(0);

  const maxSize = maxSizeMB * 1024 * 1024;

  useEffect(() => {
    if (currentUrl !== fileUrl) {
      setFileUrl(currentUrl || null);
      setFileName(currentUrl ? getFileNameFromUrl(currentUrl) : null);
    }
  }, [currentUrl]);

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(0);
    setFileName(null);
    toast.info('Upload cancelled');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state
    setError(null);
    setUploadProgress(0);
    setUploadSpeed(0);

    // Validate file size BEFORE upload
    if (file.size > maxSize) {
      setError(`File is too large (${formatFileSize(file.size)}). Maximum size is ${maxSizeMB}MB.`);
      toast.error(`File exceeds ${maxSizeMB}MB limit`);
      e.target.value = ''; // Reset input
      return;
    }

    setIsUploading(true);
    setFileName(file.name);
    startTimeRef.current = Date.now();
    lastLoadedRef.current = 0;

    try {
      const url = await uploadWithProgress(file);
      setFileUrl(url);
      onUploadComplete(url);
      toast.success('File uploaded successfully');
    } catch (err: any) {
      console.error('Upload error:', err);
      if (err.name === 'AbortError' || err.message === 'Upload cancelled') {
        // Already handled
      } else {
        setError(err.message || 'Failed to upload file');
        toast.error(err.message || 'Upload failed');
      }
      setFileName(null);
      setFileUrl(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      xhrRef.current = null;
    }
  };

  const uploadWithProgress = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);

          // Calculate speed
          const now = Date.now();
          const elapsed = (now - startTimeRef.current) / 1000;
          if (elapsed > 0) {
            const speed = event.loaded / elapsed;
            setUploadSpeed(speed);
          }
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.url) {
              resolve(response.url);
            } else if (response.error) {
              reject(new Error(response.error));
            } else {
              reject(new Error('Invalid response from server'));
            }
          } catch (e) {
            reject(new Error('Failed to parse server response'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.error || `Upload failed (${xhr.status})`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out. Please try again.'));
      });

      // Set timeout for very large files (10 min)
      xhr.timeout = 600000;

      xhr.open('POST', `/api/upload/blob?filename=${encodeURIComponent(file.name)}`);
      xhr.send(file);
    });
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        <span className="text-xs text-gray-400 ml-2">(Max {maxSizeMB}MB)</span>
      </label>
      
      {error && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="ml-auto hover:bg-red-100 dark:hover:bg-red-800/50 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors bg-white dark:bg-gray-800/50">
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileChange}
          accept={accept}
          disabled={isUploading}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          {isUploading ? (
            <div className="flex flex-col items-center space-y-3 py-2 w-full">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Uploading {fileName}...
              </p>
              
              {/* Progress Bar */}
              <div className="w-full max-w-xs">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{uploadProgress}%</span>
                  <span>{formatSpeed(uploadSpeed)}</span>
                </div>
              </div>
              
              {/* Cancel Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cancelUpload();
                }}
                className="text-xs text-red-500 hover:text-red-600 font-medium z-20 relative mt-2"
              >
                Cancel Upload
              </button>
            </div>
          ) : fileUrl ? (
            <div className="flex flex-col items-center space-y-3 py-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full">
                <File className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-900 dark:text-white font-semibold truncate max-w-[200px]">
                  {fileName}
                </p>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 z-20 relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View File
                  </a>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileName(null);
                      setFileUrl(null);
                      setError(null);
                    }}
                    className="text-xs text-red-500 hover:text-red-600 font-medium z-20 relative"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 py-2">
              <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                <Upload className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Click or drag to upload
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Supports PDF, DOCX, PPT, Videos, and more
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
