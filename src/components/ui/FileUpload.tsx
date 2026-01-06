'use client';

import React, { useState, useEffect } from 'react';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  accept?: string;
  label?: string;
  currentUrl?: string;
}

const getFileNameFromUrl = (url: string) => {
  try {
    const decodedUrl = decodeURIComponent(url);
    const parts = decodedUrl.split('/');
    const fileNameWithHash = parts[parts.length - 1];
    // For Vercel Blob, it might have a hash suffix before the extension
    // For Cloudinary, it's usually just the filename
    return fileNameWithHash;
  } catch (e) {
    return 'Existing File';
  }
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  accept = '.pdf,.doc,.docx,.txt',
  label = 'Upload Document',
  currentUrl
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(currentUrl || null);
  const [fileName, setFileName] = useState<string | null>(currentUrl ? getFileNameFromUrl(currentUrl) : null);

  useEffect(() => {
    if (currentUrl !== fileUrl) {
      setFileUrl(currentUrl || null);
      setFileName(currentUrl ? getFileNameFromUrl(currentUrl) : null);
    }
  }, [currentUrl]);

  useEffect(() => {
    if (currentUrl !== fileUrl) {
      setFileUrl(currentUrl || null);
      setFileName(currentUrl ? getFileNameFromUrl(currentUrl) : null);
    }
  }, [currentUrl]);

  useEffect(() => {
    if (currentUrl !== fileUrl) {
      setFileUrl(currentUrl || null);
      setFileName(currentUrl ? getFileNameFromUrl(currentUrl) : null);
    }
  }, [currentUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFileName(file.name);

    try {
      const response = await fetch(`/api/upload/blob?filename=${file.name}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) throw new Error('Upload failed');

      const blob = await response.json();
      setFileUrl(blob.url);
      onUploadComplete(blob.url);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      setFileName(null);
      setFileUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
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
            <div className="flex flex-col items-center space-y-2 py-2">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">
                Uploading {fileName}...
              </p>
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
                Supports PDF, DOCX, TXT
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
