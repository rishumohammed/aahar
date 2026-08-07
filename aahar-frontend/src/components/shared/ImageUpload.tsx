"use client";

import { useState, useRef } from "react";
import { uploadApi } from "@/lib/api";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
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
          <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-aahar-border group-hover:border-aahar-teal transition-all">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <button 
              onClick={(e) => {
                e.preventDefault();
                onChange("");
              }}
              className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-rose-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
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
