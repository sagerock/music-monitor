'use client';

import { useState, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X, Camera, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onUploadSuccess?: (avatarUrl: string) => void;
  onDeleteSuccess?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

interface UploadResponse {
  success: boolean;
  data?: {
    avatarUrl: string;
    fileName: string;
  };
  error?: string;
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  onUploadSuccess, 
  onDeleteSuccess,
  size = 'lg' 
}: AvatarUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Size classes
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const { data } = await api.post<UploadResponse>('/api/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: (data) => {
      if (data.success && data.data?.avatarUrl) {
        setPreview(null);
        setError(null);
        // Update the parent form data without triggering form submission
        onUploadSuccess?.(data.data.avatarUrl);
        // Don't invalidate queries here to avoid tab reset
      } else {
        setError(data.error || 'Upload failed');
      }
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || 'Upload failed');
      setPreview(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete('/api/upload/avatar');
      return data;
    },
    onSuccess: () => {
      setPreview(null);
      setError(null);
      // Update the parent form data without triggering form submission
      onDeleteSuccess?.();
      // Don't invalidate queries here to avoid tab reset
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || 'Delete failed');
    },
  });

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, WebP, or GIF)';
    }

    // Check file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  }, []);

  // Handle file selection
  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadMutation.mutate(file);
  }, [validateFile, uploadMutation]);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  // Handle click to open file dialog
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const displayImage = preview || currentAvatarUrl;
  const isLoading = uploadMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-4">
      {/* Avatar Display/Upload Area */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {displayImage ? (
            <div className={`${sizeClasses[size]} rounded-full overflow-hidden relative group`}>
              <img
                src={displayImage}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleClick}
                  disabled={isLoading}
                  className="p-2 text-white hover:text-spotify-green transition-colors"
                  title="Change avatar"
                >
                  <Camera className={iconSizes[size]} />
                </button>
              </div>

              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Loader2 className={`${iconSizes[size]} text-white animate-spin`} />
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={handleClick}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                ${sizeClasses[size]} rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 
                flex items-center justify-center cursor-pointer transition-colors
                ${dragActive ? 'border-spotify-green bg-green-50 dark:bg-green-900/20' : 'hover:border-gray-400'}
                ${isLoading ? 'pointer-events-none' : ''}
              `}
            >
              {isLoading ? (
                <Loader2 className={`${iconSizes[size]} text-gray-400 animate-spin`} />
              ) : (
                <Upload className={`${iconSizes[size]} text-gray-400`} />
              )}
            </div>
          )}
        </div>

        {/* Upload/Delete Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleClick}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-spotify-green text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {currentAvatarUrl ? 'Change' : 'Upload'}
          </button>
          
          {currentAvatarUrl && (
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Drag and drop an image or click to browse. Max size: 5MB. Formats: JPEG, PNG, WebP, GIF.
      </p>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}