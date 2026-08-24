"use client";

import { useState, useRef } from "react";
import { uploadApi } from "@/lib/api";
import { Upload, X, Loader2, Image as ImageIcon, Eye } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { MAX_PHOTO_SIZE_MB, validateFileSize } from "@/lib/upload";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export function ImageUpload({ value, onChange, label, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeError = validateFileSize(file, MAX_PHOTO_SIZE_MB);
    if (sizeError) {
      toast.error(sizeError);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const res = await uploadApi.singlePhoto(file);
      const url = res.data.data.url;
      // Store clean relative URL (or external URL as is)
      onChange(url);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload failed", error);
      const errMsg = error.response?.data?.message || error.message || `Failed to upload image. Maximum allowed size is ${MAX_PHOTO_SIZE_MB}MB.`;
      toast.error(errMsg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const previewUrl = getImageUrl(value);

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-[10px] font-black uppercase tracking-widest text-aahar-body/40">{label}</label>}
      
      <div className="relative group">
        {previewUrl ? (
          <>
            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-aahar-border group-hover:border-aahar-teal transition-all">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setIsPreviewOpen(true);
                  }}
                  className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors backdrop-blur-sm"
                  title="Preview Image"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    onChange("");
                  }}
                  className="p-3 bg-rose-500/80 hover:bg-rose-500 text-white rounded-full transition-colors backdrop-blur-sm"
                  title="Remove Image"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {isPreviewOpen && (
              <div 
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-10"
                onClick={() => setIsPreviewOpen(false)}
              >
                <button 
                  className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-white/10 hover:bg-white/30 rounded-full text-white transition-colors z-[110]"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
                <img 
                  src={previewUrl} 
                  alt="Full Preview" 
                  className="max-w-full max-h-full rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()} 
                />
              </div>
            )}
          </>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "aspect-video rounded-2xl border-2 border-dashed border-aahar-border bg-aahar-wash/30 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-aahar-teal hover:bg-aahar-teal/5 transition-all group",
              uploading && "pointer-events-none opacity-60"
            )}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-aahar-teal" />
            ) : (
              <>
                <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                  <Upload className="h-6 w-6 text-aahar-teal" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-aahar-dark uppercase tracking-widest">Select Image</p>
                  <p className="text-[9px] text-aahar-body/40 mt-1 uppercase font-bold tracking-tight">JPG, PNG or WEBP (Max {MAX_PHOTO_SIZE_MB}MB)</p>
                </div>
              </>
            )}
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleUpload} 
        />
      </div>
    </div>
  );
}
