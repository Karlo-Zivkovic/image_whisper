import { User, MessageSquare, X } from "lucide-react";
import Image from "next/image";
import { Request, Response } from "@/lib/supabase/entity.types";
import { Button } from "@/components/ui/button";

export default function MessageDisplay({
  conversationThreads,
  chatWindowRef,
  imagePreviews = [],
  removeImage,
}: {
  conversationThreads: { request: Request; response?: Response | null }[];
  chatWindowRef: React.MutableRefObject<HTMLDivElement | null>;
  imagePreviews?: string[];
  removeImage?: (index: number) => void;
}) {
  if (conversationThreads.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No messages in this chat</p>
      </div>
    );
  }

  return (
    <div
      ref={chatWindowRef}
      className="flex-grow overflow-auto p-4 flex flex-col relative"
    >
      <div
        className={`max-w-3xl mx-auto w-full flex flex-col relative z-20 ${
          conversationThreads.length === 1 ? "flex-initial" : "flex-1"
        }`}
      >
        {/* Single Card View for Request and Response */}
        {conversationThreads.length > 0 && (
          <div
            className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${
              conversationThreads.length === 1 ? "max-h-fit" : ""
            }`}
          >
            {/* Request Section - Top */}
            <div
              className={`${
                conversationThreads.length === 1 ? "p-3" : "p-4"
              } bg-amber-50 border-b border-gray-200`}
            >
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                  <User className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-800">User Request</p>
                  <p className="text-xs text-gray-500">
                    {new Date(
                      conversationThreads[0].request.created_at
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                {conversationThreads[0].request.prompt}
              </p>
              {conversationThreads[0].request.image_url && (
                <div className="flex justify-center">
                  <Image
                    src={conversationThreads[0].request.image_url}
                    alt="Request Image"
                    width={400}
                    height={400}
                    className={`rounded-md ${
                      conversationThreads.length === 1
                        ? "max-h-[250px]"
                        : "max-h-[300px]"
                    } w-auto object-contain`}
                  />
                </div>
              )}
            </div>

            {/* Response Section - Bottom */}
            {conversationThreads[0].response ? (
              <div
                className={`${
                  conversationThreads.length === 1 ? "p-3" : "p-4"
                } bg-white`}
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center mr-2">
                    <MessageSquare className="h-4 w-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-teal-800">AI Response</p>
                    <p className="text-xs text-gray-500">
                      {new Date(
                        conversationThreads[0].response.created_at
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
                {conversationThreads[0].response.message && (
                  <p className="text-gray-700 mb-3">
                    {conversationThreads[0].response.message}
                  </p>
                )}
                {conversationThreads[0].response.image_url &&
                  conversationThreads[0].response.image_url.length > 0 && (
                    <div
                      className={`flex justify-center ${
                        conversationThreads[0].response.image_url.length > 1
                          ? "flex-wrap gap-3"
                          : ""
                      }`}
                    >
                      {conversationThreads[0].response.image_url.map(
                        (url, i) => (
                          <div key={i} className="mt-2">
                            <Image
                              src={url}
                              alt={`Response Image ${i + 1}`}
                              width={
                                conversationThreads[0].response &&
                                conversationThreads[0].response.image_url &&
                                conversationThreads[0].response.image_url
                                  .length > 1
                                  ? 320
                                  : 400
                              }
                              height={
                                conversationThreads[0].response &&
                                conversationThreads[0].response.image_url &&
                                conversationThreads[0].response.image_url
                                  .length > 1
                                  ? 320
                                  : 400
                              }
                              className={`rounded-md ${
                                conversationThreads.length === 1
                                  ? "max-h-[250px]"
                                  : "max-h-[300px]"
                              } w-auto object-contain`}
                            />
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
            ) : (
              <div className={`p-4 bg-white border-t border-gray-200`}>
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center mr-2">
                    <MessageSquare className="h-4 w-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-teal-800">AI Response</p>
                    <p className="text-xs text-gray-500">
                      Preparing response...
                    </p>
                  </div>
                </div>

                {imagePreviews && imagePreviews.length > 0 ? (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-2">
                      Images to include in your response:
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square"
                        >
                          <Image
                            src={preview}
                            alt={`Preview Image ${index + 1}`}
                            width={300}
                            height={300}
                            className="w-full h-full object-cover rounded-md max-h-[200px]"
                          />
                          {removeImage && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-2">
                    No response yet
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Add a bit of space at the bottom for better scrolling */}
        <div
          className={`${conversationThreads.length === 1 ? "h-2" : "h-4"}`}
        ></div>
      </div>
    </div>
  );
}
