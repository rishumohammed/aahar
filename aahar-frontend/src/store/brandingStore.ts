import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { settingsApi } from "@/lib/api";
import { getImageUrl } from "@/lib/utils";

export interface BrandingConfig {
  logoLight?: string;
  logoDark?: string;
  favicon?: string;
  certificateLogo?: string;
}

interface BrandingState {
  branding: BrandingConfig;
  isLoading: boolean;
  fetchBranding: () => Promise<void>;
  setBranding: (branding: BrandingConfig) => void;
}

export const useBrandingStore = create<BrandingState>()(
  persist(
    (set) => ({
      branding: {
        logoLight: "",
        logoDark: "",
        favicon: "",
        certificateLogo: "",
      },
      isLoading: false,

      fetchBranding: async () => {
        try {
          const res = await settingsApi.get("branding_config");
          if (res.data) {
            const data: BrandingConfig =
              typeof res.data === "string" ? JSON.parse(res.data) : res.data;
            set({ branding: data });

            // Dynamic browser favicon update
            if (data.favicon && typeof window !== "undefined") {
              const faviconUrl = getImageUrl(data.favicon);
              let faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
              if (!faviconLink) {
                faviconLink = document.createElement("link");
                faviconLink.rel = "shortcut icon";
                document.head.appendChild(faviconLink);
              }
              faviconLink.href = faviconUrl;
            }
          }
        } catch {
          // 404 or network error — silently fallback
        }
      },

      setBranding: (branding: BrandingConfig) => {
        set({ branding });
        if (branding.favicon && typeof window !== "undefined") {
          const faviconUrl = getImageUrl(branding.favicon);
          let faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
          if (!faviconLink) {
            faviconLink = document.createElement("link");
            faviconLink.rel = "shortcut icon";
            document.head.appendChild(faviconLink);
          }
          faviconLink.href = faviconUrl;
        }
      },
    }),
    {
      name: "aahar-branding",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
