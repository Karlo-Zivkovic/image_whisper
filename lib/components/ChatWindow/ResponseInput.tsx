import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Send, Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ResponseFormValues } from "./ChatWindow";

export default function ResponseInput({
  form,
  fileInputRef,
  isSubmitting,
  isUploading,
  uploadedImages,
  handleFileSelect,
  onSubmit,
}: {
  form: UseFormReturn<ResponseFormValues>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isSubmitting: boolean;
  isUploading: boolean;
  uploadedImages: File[];
  handleFileSelect: (files: FileList | File[]) => void;
  onSubmit: (data: ResponseFormValues) => Promise<void>;
}) {
  return (
    <div className="border-t bg-white p-2 flex-shrink-0">
      <div className="max-w-4xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="relative">
              <div className="flex items-center gap-2">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileSelect(e.target.files);
                    }
                  }}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={
                    uploadedImages.length >= 3 || isSubmitting || isUploading
                  }
                >
                  <Upload className="h-5 w-5 text-gray-500" />
                  <span className="sr-only">Upload images</span>
                </Button>

                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem className="m-0">
                        <FormControl>
                          <Textarea
                            placeholder="Type your response here..."
                            className="resize-none bg-gray-100 py-2 px-4 min-h-[44px] max-h-[120px] rounded-full flex items-center text-left"
                            style={{
                              paddingTop: "12px",
                              paddingBottom: "12px",
                            }}
                            disabled={isSubmitting || isUploading}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  size="icon"
                  className="h-10 w-10 rounded-full shrink-0"
                >
                  {isSubmitting || isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Upload status indicator */}
            {(uploadedImages.length > 0 || isUploading) && (
              <div className="text-xs text-gray-500 text-center mt-1">
                {isUploading ? (
                  "Uploading images..."
                ) : (
                  <>
                    {uploadedImages.length}{" "}
                    {uploadedImages.length === 1 ? "image" : "images"} attached
                    {uploadedImages.length < 3 &&
                      ` • You can add ${3 - uploadedImages.length} more`}
                  </>
                )}
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
