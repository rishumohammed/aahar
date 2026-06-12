"use client";

import { useState, useRef } from "react";
import { uploadApi } from "@/lib/api";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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

    setUploading(true);
    try {
      const res = await uploadApi.singlePhoto(file);
      const url = res.data.data.url;
      // Convert to full URL for preview
      const fullUrl = url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"}${url}`;
      onChange(fullUrl);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-[10px] font-black uppercase tracking-widest text-aahar-body/40">{label}</label>}
      
      <div className="relative group">
        {value ? (
          <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-aahar-border group-hover:border-aahar-teal transition-all">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
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
                  <p className="text-[9px] text-aahar-body/40 mt-1 uppercase font-bold tracking-tight">JPG, PNG or WEBP (Max 5MB)</p>
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
