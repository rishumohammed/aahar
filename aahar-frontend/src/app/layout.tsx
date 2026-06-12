import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/shared/AuthProvider";
import NavigationLoadingBar from "@/components/shared/NavigationLoadingBar";
import { Suspense } from "react";
import Script from "next/script";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair",
  style: ["normal", "italic"]
});

export const metadata: Metadata = {
  title: {
    template: "%s | AAHAR",
    default:  "AAHAR — Hospitality Trust Platform",
  },
  description:
    "Discover and trust certified restaurants, hotels, and resorts. AAHAR independently audits and accredits hospitality businesses across India and GCC.",
  keywords: ["AAHAR", "restaurant certification", "hotel certification", "hygiene audit", "hospitality trust"],
  openGraph: {
    type:        "website",
    siteName:    "AAHAR",
    title:       "AAHAR — Hospitality Trust Platform",
    description: "Trust every meal. Verify every stay.",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans">
        <Suspense fallback={null}>
          <NavigationLoadingBar />
        </Suspense>
        <AuthProvider>
          <main className="flex-1">{children}</main>
        </AuthProvider>
        <Toaster richColors position="top-right" />
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
