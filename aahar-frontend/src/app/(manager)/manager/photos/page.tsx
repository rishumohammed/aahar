"use client";
import Image from "next/image";
import { toast } from"sonner";
import { useState, useCallback, useEffect } from"react";
import { useDropzone } from"react-dropzone";
import { 
 X, 
 UploadCloud, 
 GripHorizontal, 
 CheckCircle2,
 AlertCircle,
 Image as ImageIcon
} from"lucide-react";
import { hotelApi, masterApi } from "@/lib/api";
import { 
  uploadHotelPhotos, 
  deleteHotelPhoto,
  MAX_PHOTO_SIZE_MB 
} from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, getImageUrl } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

// ── Types ──────────────────────────────────────────────────
interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

export default function PhotoGalleryPage() {
  const [photos, setPhotos] = useState<Record<string, string[]>>({});
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState("rooms");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [storageProvider, setStorageProvider] = useState("local");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ── Load Hotel & Master Data & Provider ──────────────────────
  useEffect(() => {
    const user = useAuthStore.getState().user;
    hotelApi.list({ managerId: user?.id, limit: 1 })
      .then(r => {
        const res = r.data.data.items[0];
        if (res) {
          setHotelId(res.id);
          setPhotos(res.photos || {});
        }
      })
      .catch(console.error);

    masterApi.list("PHOTO_CATEGORY_HOTEL")
      .then(r => {
        const masterItems = r.data?.data || [];
        if (masterItems.length > 0) {
          const cats = masterItems.map((m: any) => ({
            id: m.key,
            label: m.label
          }));
          setCategories(cats);
          setActiveCategory(cats[0].id);
        } else {
          const fallbackHotel = [
            { id: "rooms", label: "Rooms & Suites" },
            { id: "exterior", label: "Property Exterior" },
            { id: "lobby", label: "Lobby & Reception" },
            { id: "amenities", label: "Amenities & Facilities" },
            { id: "dining", label: "Dining Area" },
            { id: "pool", label: "Pool & Spa" }
          ];
          setCategories(fallbackHotel);
          setActiveCategory("rooms");
        }
      })
      .catch(() => {
        const fallbackHotel = [
          { id: "rooms", label: "Rooms & Suites" },
          { id: "exterior", label: "Property Exterior" },
          { id: "lobby", label: "Lobby & Reception" },
          { id: "amenities", label: "Amenities & Facilities" },
          { id: "dining", label: "Dining Area" },
          { id: "pool", label: "Pool & Spa" }
        ];
        setCategories(fallbackHotel);
        setActiveCategory("rooms");
      });

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/upload/provider`)
      .then(r => r.json())
      .then(d => setStorageProvider(d.data.provider))
      .catch(() => setStorageProvider("local"));
  }, []);

  // ── Toast Logic ──────────────────────────────────────────
  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  // ── Dropzone Handlers ─────────────────────────────────────
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const valid = acceptedFiles.filter(f => {
      if (!f.type.startsWith("image/")) {
        showToast(`"${f.name}" is not an image file`, "error");
        return false;
      }
      if (f.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
        showToast(`"${f.name}" (${(f.size / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum allowed size of ${MAX_PHOTO_SIZE_MB}MB.`, "error");
        return false;
      }
      return true;
    });

    if (!valid.length || !hotelId) return;

    setUploading(true);
    setProgress(0);

    try {
      const urls = await uploadHotelPhotos(
        hotelId,
        activeCategory,
        valid,
        (pct) => setProgress(pct),
      );
      // Add real URLs to state
      const photosToSave = {
        ...photos,
        [activeCategory]: [...(photos[activeCategory] || []), ...urls],
      };
      setPhotos(photosToSave);
      await hotelApi.update(hotelId, { photos: photosToSave }).catch(console.error);
      showToast(`${urls.length} photo(s) uploaded successfully`, "success");
    } catch (err: any) {
      showToast(err.message ?? `Upload failed. Maximum allowed size is ${MAX_PHOTO_SIZE_MB}MB.`, "error");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [hotelId, activeCategory, photos, showToast]);

  const handleDelete = async (url: string) => {
    if (!hotelId) return;
    try {
      await deleteHotelPhoto(hotelId, activeCategory, url).catch(() => {});
      const photosToSave = {
        ...photos,
        [activeCategory]: (photos[activeCategory] || []).filter(u => u !== url),
      };
      setPhotos(photosToSave);
      await hotelApi.update(hotelId, { photos: photosToSave }).catch(console.error);
      showToast("Photo deleted", "success");
    } catch {
      showToast("Failed to delete photo", "error");
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 10,
    disabled: uploading,
    noClick: true,
    noKeyboard: true
  });

  return (
    <div {...getRootProps()} className="p-8 max-w-6xl mx-auto space-y-10 pb-32 focus:outline-none relative">
      <input {...getInputProps()} />
      
      {isDragActive && (
        <div className="absolute inset-0 z-50 bg-admin-primary/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center border-4 border-dashed border-white m-4 pointer-events-none">
          <UploadCloud className="h-20 w-20 text-white animate-bounce mb-4" />
          <h2 className="text-3xl font-bold text-white tracking-tight uppercase">Drop photos here</h2>
          <p className="text-white/80 text-sm font-medium mt-1">Supports JPG, PNG, WEBP up to {MAX_PHOTO_SIZE_MB}MB each</p>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Photo Gallery</h1>
          <p className="text-slate-500 font-medium mt-1">Manage high-quality visuals for your business profile. Maximum file size allowed is {MAX_PHOTO_SIZE_MB}MB per photo.</p>
        </div>
        <Button onClick={open} disabled={uploading} className="bg-admin-primary hover:bg-admin-primary-hover text-white shadow-md font-semibold h-12 px-6 rounded-lg text-base">
          <UploadCloud className="h-5 w-5 mr-2" /> 
          {uploading ? `Uploading ${progress}%...` : "Add Images"}
        </Button>
      </div>

 {/* Storage Provider Badge */}
 <div className="flex items-center gap-2 mb-4">
 <span className="text-2xs text-mid">Storage:</span>
 <span className={`badge text-2xs ${
 storageProvider ==="s3"
 ?"bg-admin-primary/10 text-admin-primary border border-admin-primary/20 px-2 py-0.5 rounded-full"
 :"bg-wash text-mid border border-border px-2 py-0.5 rounded-full"
 }`}>
 {storageProvider ==="s3"?"☁ AWS S3":"💾 Local disk"}
 </span>
 {storageProvider ==="local"&& (
 <span className="text-2xs text-mid">
 (switch to S3 in .env before deploying)
 </span>
 )}
 </div>

 {/* Category Tabs */}
 <div className="border-b border-slate-200 flex gap-8 overflow-x-auto no-scrollbar scroll-smooth">
 {categories.map((cat) => {
 const isActive = activeCategory === cat.id;
 const count = (photos[cat.id] || []).length;
 return (
 <button
 key={cat.id}
 onClick={() => setActiveCategory(cat.id)}
 className={cn(
"pb-4 px-1 flex items-center gap-2 whitespace-nowrap transition-all border-b-2",
 isActive 
 ?"border-admin-primary text-admin-primary font-bold"
 :"border-transparent text-slate-500/40 font-bold hover:text-slate-500"
 )}
 >
 <span className="text-sm uppercase tracking-wider">{cat.label}</span>
 <Badge className={cn(
"rounded-lg text-[10px] px-1.5 py-0",
 isActive ?"bg-admin-primary text-white":"bg-slate-50 text-slate-500/40"
 )}>
 {count}
 </Badge>
 </button>
 );
 })}
 </div>

 {/* Gallery Grid */}
 <section className="space-y-8">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
  {(photos[activeCategory] || []).map((url, index) => {
   const imageUrl = getImageUrl(url);
   return (
  <div key={url} className="relative aspect-square group">
  <div className="w-full h-full rounded-md overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-md transition-all">
  <Image 
  src={imageUrl} 
  alt={`${activeCategory} ${index}`}
  fill
  unoptimized
  sizes="(max-width: 768px) 50vw, 25vw"
  className="object-cover"
  />
  </div>
 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-md">
 <button 
 onClick={() => handleDelete(url)}
 className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
 >
 <X className="h-4 w-4"/>
 </button>
 <div className="absolute bottom-2 left-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all">
 <GripHorizontal className="h-4 w-4 text-slate-800"/>
 </div>
 </div>
  </div>
  );
  })}
 
 {(photos[activeCategory] || []).length === 0 && (
 <div className="col-span-full py-20 bg-slate-50/30 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-center">
 <div className="p-4 bg-white rounded-md shadow-sm mb-4">
 <ImageIcon className="h-8 w-8 text-slate-500/20"/>
 </div>
 <h4 className="text-lg font-bold text-slate-800 tracking-tight">No photos in this category</h4>
 <p className="text-sm text-slate-500 font-medium mt-1">Upload some visuals to make your profile stand out.</p>
 </div>
 )}
 </div>
 </section>


 {/* Toast Notifications */}
 <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 items-end">
 {toasts.map(toast => (
 <div 
 key={toast.id} 
 className={cn(
"px-6 py-4 rounded-md text-white font-bold text-sm shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10",
 toast.type === 'success' ?"bg-admin-primary":"bg-rose-500"
 )}
 >
 {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5"/> : <AlertCircle className="h-5 w-5"/>}
 <span>{toast.message}</span>
 <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>
 <X className="h-4 w-4 opacity-50 hover:opacity-100"/>
 </button>
 </div>
  ))}
 </div>
 </div>
 );
}
