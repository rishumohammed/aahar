import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LocationState {
  city: string | null;
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
  detectLocation: () => Promise<void>;
  setLocation: (city: string) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      city: null,
      lat: null,
      lng: null,
      loading: false,
      error: null,
      
      setLocation: (city: string) => set({ city }),

      detectLocation: async () => {
        set({ loading: true, error: null });

        if (!navigator.geolocation) {
          set({ loading: false, error: "Geolocation is not supported by your browser." });
          return;
        }

        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            });
          });

          const { latitude, longitude } = position.coords;

          // Reverse geocoding using Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en-US,en;q=0.9",
                // Nominatim asks for User-Agent
                "User-Agent": "Aahar-App/1.0",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch location details.");
          }

          const data = await response.json();
          // Extract city or town or village or county from address
          const address = data.address;
          const detectedCity = address.city || address.town || address.village || address.county || address.state || null;

          if (detectedCity) {
            set({ city: detectedCity, lat: latitude, lng: longitude, loading: false, error: null });
          } else {
            set({ lat: latitude, lng: longitude, loading: false, error: "Could not determine city name." });
          }

        } catch (error: any) {
          console.error("Location detection error:", error);
          let errorMsg = "Failed to detect location.";
          if (error.code === 1) {
            errorMsg = "Location access denied. Please enable permissions.";
          }
          set({ loading: false, error: errorMsg });
        }
      },
    }),
    {
      name: "aahar-location",
      partialize: (state) => ({ city: state.city, lat: state.lat, lng: state.lng }), // Persist only these
    }
  )
);
