import { useAuthStore } from "@/store/authStore";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface UploadedPhoto {
  url:      string;
  category: string;
  filename: string;
}

// Upload photos for a restaurant
export const uploadRestaurantPhotos = async (
  restaurantId: string,
  category: string,
  files: File[],
  onProgress?: (pct: number) => void,
): Promise<string[]> => {
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
        resolve(data.data.urls);
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.message ?? "Upload failed"));
        } catch {
          reject(new Error("Upload failed: Server returned an invalid response"));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));

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
        resolve(data.data.urls);
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.message ?? "Upload failed"));
        } catch {
          reject(new Error("Upload failed: Server returned an invalid response"));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));

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
        resolve({ url: data.data.url, documentId: data.data.document.id });
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.message ?? "Upload failed"));
        } catch {
          reject(new Error("Upload failed: Server returned an invalid response"));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));

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
