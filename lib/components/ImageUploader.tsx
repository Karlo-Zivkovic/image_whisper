"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Image as ImageIcon,
  Clipboard,
  Loader2,
  X,
} from "lucide-react";
import { MAX_IMAGES } from "../hooks/useChatMessageHandler";
import { MutableRefObject } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  expanded: boolean;
  toggleExpanded: (value?: boolean) => void;
  files: File[];
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePaste: (e: React.ClipboardEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleUpload: () => void;
  removeFile: (index: number) => void;
  focusPasteArea: () => void;
  isUploading: boolean;
  uploadLoading: boolean;
  uploadError: string | null;
  pasteError: string | null;
  pasteAreaRef: MutableRefObject<HTMLDivElement | null>;
}

export default function ImageUploader({
  expanded,
  toggleExpanded,
  files,
  handleFileSelect,
  handlePaste,
  handleDrop,
  handleDragOver,
  handleUpload,
  removeFile,
  focusPasteArea,
  isUploading,
  uploadLoading,
  uploadError,
  pasteError,
  pasteAreaRef,
}: ImageUploaderProps) {
  // Display the upload button if not expanded
  if (!expanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 text-xs"
        onClick={() => toggleExpanded(true)}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        {isUploading ? "Uploading..." : "Upload Response"}
      </Button>
    );
  }

  // Display the expanded upload UI
  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            Upload response images (up to {MAX_IMAGES})
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleExpanded(false)}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Preview of selected files */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 my-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative group bg-gray-100 rounded-md h-20"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index}`}
                  className="h-full w-full object-contain p-1"
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Paste area */}
      <div
        ref={pasteAreaRef}
        tabIndex={0}
        onPaste={handlePaste}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={focusPasteArea}
        className={`border-2 border-dashed rounded-md p-4 text-center text-sm cursor-pointer
                focus:outline-none focus:border-primary/50 transition-colors
                ${
                  files.length > 0
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
        style={{ minHeight: "80px" }}
        aria-disabled={isUploading}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary mb-1" />
            <p className="text-primary">Uploading images...</p>
          </div>
        ) : (
          <>
            <Clipboard className="h-5 w-5 mx-auto mb-1 text-gray-400" />
            {files.length > 0 ? (
              <p className="text-green-600">
                {files.length} {files.length === 1 ? "image" : "images"} ready
              </p>
            ) : (
              <p className="text-gray-500">
                Click here to paste an image or drag and drop
              </p>
            )}
          </>
        )}
        {pasteError && !isUploading && (
          <p className="text-red-500 text-xs mt-1">{pasteError}</p>
        )}
      </div>

      {!isUploading && (
        <>
          <p className="text-xs text-gray-500 my-1">- or -</p>

          {/* File input */}
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={
              isUploading || uploadLoading || files.length >= MAX_IMAGES
            }
            className="text-xs"
          />
        </>
      )}

      <Button
        onClick={handleUpload}
        disabled={files.length === 0 || isUploading || uploadLoading}
        size="sm"
        className="w-full text-xs"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            Uploading...
          </>
        ) : (
          `Upload ${files.length} ${files.length === 1 ? "Image" : "Images"}`
        )}
      </Button>
      {uploadError && !isUploading && (
        <div className="text-red-600 text-xs">{uploadError}</div>
      )}
    </div>
  );
}
