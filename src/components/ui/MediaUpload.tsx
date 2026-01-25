'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Video, X, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface MediaUploadProps {
  onUploadComplete: (url: string) => void;
  type: 'image' | 'video';
  label?: string;
  currentUrl?: string;
}

const getFileNameFromUrl = (url: string) => {
  try {
    const decodedUrl = decodeURIComponent(url);
    const parts = decodedUrl.split('/');
    return parts[parts.length - 1];
  } catch (e) {
    return 'Existing Media';
  }
};

const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onUploadComplete,
  type,
  label,
  currentUrl
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const [fileName, setFileName] = useState<string | null>(currentUrl ? getFileNameFromUrl(currentUrl) : null);

  useEffect(() => {
    if (currentUrl !== previewUrl) {
      setPreviewUrl(currentUrl || null);
      setFileName(currentUrl ? getFileNameFromUrl(currentUrl) : null);
    }
  }, [currentUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (type === 'image' && !file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (type === 'video' && !file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }

    setIsUploading(true);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      setPreviewUrl(result.data.url);
      onUploadComplete(result.data.url);
      toast.success(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${type}`);
      setFileName(null);
    } finally {
      setIsUploading(false);
    }
  };

  const youtubeId = previewUrl ? getYoutubeId(previewUrl) : null;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label || `Upload ${type === 'image' ? 'Image' : 'Video'}`}
      </label>
      <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors min-h-[150px] flex items-center justify-center bg-white dark:bg-gray-800/50 group">
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileChange}
          accept={type === 'image' ? 'image/*' : 'video/*'}
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center space-y-2 py-4">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">
              Uploading {fileName}...
            </p>
          </div>
        ) : previewUrl ? (
          <div className="relative w-full flex flex-col items-center space-y-3 py-2">
            <div className="relative group/preview w-full flex justify-center">
              {type === 'image' ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-[200px] rounded-lg object-cover shadow-sm border border-gray-200 dark:border-gray-700"
                />
              ) : youtubeId ? (
                <div className="w-full aspect-video max-w-[400px]">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                  ></iframe>
                </div>
              ) : (
                <video
                  src={previewUrl}
                  className="max-h-[200px] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                  controls
                />
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewUrl(null);
                  setFileName(null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-md z-20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {fileName && (
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate max-w-[250px]">
                {fileName}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 py-4">
            <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
              {type === 'image' ? (
                <ImageIcon className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
              ) : (
                <Video className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Click to upload {type}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {type === 'image' ? 'Supports JPG, PNG, WEBP' : 'Supports MP4, WEBM'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
