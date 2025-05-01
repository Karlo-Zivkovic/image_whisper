"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MAX_IMAGES } from "../hooks/useChatMessageHandler";

interface ResponseImageGalleryProps {
  responseUrls: string[];
  toggleExpanded: (value?: boolean) => void;
}

export default function ResponseImageGallery({
  responseUrls,
  toggleExpanded,
}: ResponseImageGalleryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-3">
      {responseUrls.map((url, index) => (
        <div
          key={index}
          className="relative w-full h-[200px] bg-gray-50 rounded overflow-hidden"
        >
          <Image
            src={url}
            alt={`Response image ${index + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="rounded object-contain"
          />
        </div>
      ))}

      {/* Add image button if we have less than MAX_IMAGES */}
      {responseUrls.length < MAX_IMAGES && (
        <Button
          variant="outline"
          className="h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded"
          onClick={() => toggleExpanded(true)}
        >
          <Plus className="h-6 w-6 mb-2 text-gray-400" />
          <span className="text-sm text-gray-500">Add Image</span>
        </Button>
      )}
    </div>
  );
}
