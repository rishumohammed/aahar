"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function NavigationLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Clear loading state when navigation completes
  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  // Intercept anchor clicks to show loading state immediately
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore external links, new tabs, and anchor links
      if (href.startsWith("http") && !href.startsWith(window.location.origin)) return;
      if (anchor.getAttribute("target") === "_blank") return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      // Don't show loading for the exact same URL
      const url = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      if (url.pathname === currentUrl.pathname && url.search === currentUrl.search) return;

      // Valid internal navigation, trigger loading state instantly
      setLoading(true);
    };

    // Use capture phase to catch clicks before they might be stopped by other handlers
    document.addEventListener("click", handleAnchorClick, true);
    
    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ width: "0%", opacity: 1 }}
          animate={{ width: "90%" }}
          exit={{ width: "100%", opacity: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 h-[4px] bg-aahar-teal z-[9999] shadow-[0_0_15px_rgba(10,123,123,0.8)] pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
}
