"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  uploadImageToCloudinary,
  validateImageFile,
  formatFileSize,
} from "@/app/utils/cloudinary";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  className?: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  className = "",
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError("");

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || "Invalid file");
      return;
    }

    setUploading(true);

    try {
      const result = await uploadImageToCloudinary(file);

      if (result.success && result.url) {
        onChange(result.url);
        setError("");
      } else {
        setError(result.error || "Upload failed");
      }
    } catch (err) {
      setError("Upload failed. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const openFileDialog = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Current Image Preview */}
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Uploaded preview"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
          />
          {!disabled && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
              title="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Upload Area */}
      {!value && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${
              dragActive
                ? "border-amber-500 bg-amber-50"
                : "border-gray-300 hover:border-amber-400"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${uploading ? "opacity-50 cursor-not-allowed" : ""}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled || uploading}
          />

          {uploading ? (
            <div className="space-y-2">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-amber-600" />
              <p className="text-sm text-gray-600">Uploading image...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="p-3 bg-amber-100 rounded-full">
                  <Upload className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Upload Button (Alternative) */}
      {!value && !uploading && (
        <Button
          type="button"
          variant="outline"
          onClick={openFileDialog}
          disabled={disabled}
          className="w-full border-amber-200 hover:border-amber-300 text-amber-700 hover:text-amber-800"
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Choose Image
        </Button>
      )}

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Upload Progress/Status */}
      {uploading && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            <span className="text-sm text-amber-700">
              Uploading to cloud storage...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
