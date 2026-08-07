import { useAuthStore } from "@/store/authStore";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const MAX_PHOTO_SIZE_MB = 1;
export const MAX_DOC_SIZE_MB = 5;

export interface UploadedPhoto {
  url:      string;
  category: string;
  filename: string;
}

export const validateFileSize = (file: File, maxMb: number = MAX_PHOTO_SIZE_MB): string | null => {
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    const actualMb = (file.size / (1024 * 1024)).toFixed(1);
    return `File "${file.name}" (${actualMb} MB) exceeds the maximum allowed size of ${maxMb} MB.`;
  }
  return null;
};

// Upload photos for a restaurant
export const uploadRestaurantPhotos = async (
  restaurantId: string,
  category: string,
  files: File[],
  onProgress?: (pct: number) => void,
): Promise<string[]> => {
  for (const f of files) {
    const error = validateFileSize(f, MAX_PHOTO_SIZE_MB);
    if (error) throw new Error(error);
  }

  const token = useAuthStore.getState().token;
  const form  = new FormData();
  form.append("category", category);
  files.forEach(f => form.append("files", f));

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.data?.urls || data.urls || []);
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.message ?? `Upload failed (Maximum size allowed: ${MAX_PHOTO_SIZE_MB}MB)`));
        } catch {
          reject(new Error(`Upload failed: Maximum size allowed is ${MAX_PHOTO_SIZE_MB}MB`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error during file upload. Please check your connection."));

    xhr.open("POST", `${API}/upload/photos`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(form);
  });
};

// Upload photos for a hotel
export const uploadHotelPhotos = async (
  hotelId: string,
  category: string,
  files: File[],
  onProgress?: (pct: number) => void,
): Promise<string[]> => {
  for (const f of files) {
    const error = validateFileSize(f, MAX_PHOTO_SIZE_MB);
    if (error) throw new Error(error);
  }

  const token = useAuthStore.getState().token;
  const form  = new FormData();
  form.append("category", category);
  files.forEach(f => form.append("files", f));

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.data?.urls || data.urls || []);
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.message ?? `Upload failed (Maximum size allowed: ${MAX_PHOTO_SIZE_MB}MB)`));
        } catch {
          reject(new Error(`Upload failed: Maximum size allowed is ${MAX_PHOTO_SIZE_MB}MB`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error during file upload. Please check your connection."));

    xhr.open("POST", `${API}/upload/photos`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(form);
  });
};

// Upload a single document
export const uploadDocument = async (
  applicationId: string,
  docType: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ url: string; documentId: string }> => {
  const error = validateFileSize(file, MAX_DOC_SIZE_MB);
  if (error) throw new Error(error);

  const token = useAuthStore.getState().token;
  const form  = new FormData();
  form.append("docType", docType);
  form.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({ url: data.data.url, documentId: data.data.document?.id || "" });
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.message ?? `Document upload failed (Maximum size allowed: ${MAX_DOC_SIZE_MB}MB)`));
        } catch {
          reject(new Error(`Document upload failed: Maximum size allowed is ${MAX_DOC_SIZE_MB}MB`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error during document upload. Please check your connection."));

    xhr.open("POST", `${API}/upload/document/${applicationId}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(form);
  });
};

// Delete a restaurant photo
export const deleteRestaurantPhoto = async (
  restaurantId: string,
  category: string,
  url: string,
): Promise<void> => {
  const token = useAuthStore.getState().token;
  await fetch(`${API}/upload/restaurant/${restaurantId}/photos`, {
    method:  "DELETE",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ category, url }),
  });
};

// Delete a hotel photo
export const deleteHotelPhoto = async (
  hotelId: string,
  category: string,
  url: string,
): Promise<void> => {
  const token = useAuthStore.getState().token;
  await fetch(`${API}/upload/hotel/${hotelId}/photos`, {
    method:  "DELETE",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ category, url }),
  });
};
