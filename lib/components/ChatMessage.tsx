"use client";

import Image from "next/image";
import { ClientQueries } from "@/supabase/entity.types";
import { MessageCircle, CheckCheck } from "lucide-react";
import { useChatMessageHandler } from "../hooks/useChatMessageHandler";
import ImageUploader from "./ImageUploader";
import ResponseImageGallery from "./ResponseImageGallery";
import MessageStatus from "./MessageStatus";

export default function ChatMessage({ message }: { message: ClientQueries }) {
  const {
    // State
    expanded,
    files,
    uploadLoading,
    uploadError,
    pasteError,
    isUploading,
    currentMessage,
    responseUrls,
    hasResponse,
    queryImageUrl,
    messageTime,
    pasteAreaRef,

    // Methods
    toggleExpanded,
    handleUpload,
    handlePaste,
    handleDrop,
    handleDragOver,
    handleFileSelect,
    removeFile,
    focusPasteArea,
  } = useChatMessageHandler(message);

  return (
    <div className="flex flex-col items-start w-full max-w-[95%] mb-6">
      <div className="bg-white rounded-lg p-4 shadow-sm w-full">
        {/* Query Section */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <MessageCircle className="h-4 w-4 text-primary mr-2" />
            <h3 className="font-medium text-sm text-primary">Client Query</h3>
          </div>

          {/* Query Image */}
          {queryImageUrl && (
            <div className="relative w-full h-[280px] mb-3 bg-gray-50 rounded">
              <Image
                src={queryImageUrl}
                alt="Query image"
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                className="rounded object-contain"
              />
            </div>
          )}

          {/* Query text */}
          {currentMessage.query_text && (
            <div className="mb-2 whitespace-pre-wrap">
              <p className="text-sm">{currentMessage.query_text}</p>
            </div>
          )}

          {/* Time and status */}
          <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
            <span>{messageTime}</span>
            {!hasResponse && currentMessage.status && (
              <MessageStatus status={currentMessage.status} />
            )}
          </div>
        </div>

        {/* Response Section - Show if response exists */}
        {hasResponse && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center mb-2">
              <CheckCheck className="h-4 w-4 text-blue-500 mr-2" />
              <h3 className="font-medium text-sm text-blue-600">
                Our Response
              </h3>
            </div>

            {/* Response Images Gallery */}
            <ResponseImageGallery
              responseUrls={responseUrls}
              toggleExpanded={toggleExpanded}
            />

            {/* Response time and status */}
            <div className="flex justify-end items-center text-xs text-gray-500 mt-2">
              <MessageStatus status="completed" showCompleted={true} />
            </div>
          </div>
        )}

        {/* Upload Response UI - Show if no response yet or explicitly expanded */}
        {(!hasResponse || expanded) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <ImageUploader
              expanded={expanded}
              toggleExpanded={toggleExpanded}
              files={files}
              handleFileSelect={handleFileSelect}
              handlePaste={handlePaste}
              handleDrop={handleDrop}
              handleDragOver={handleDragOver}
              handleUpload={handleUpload}
              removeFile={removeFile}
              focusPasteArea={focusPasteArea}
              isUploading={isUploading}
              uploadLoading={uploadLoading}
              uploadError={uploadError}
              pasteError={pasteError}
              pasteAreaRef={pasteAreaRef}
            />
          </div>
        )}
      </div>
    </div>
  );
}
