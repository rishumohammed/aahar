"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Instagram, Twitter, Linkedin, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { settingsApi } from "@/lib/api";
import { useBrandingStore } from "@/store/brandingStore";
import { getImageUrl } from "@/lib/utils";

type FooterLink = {
  label: string;
  type?: "url" | "page";
  url?: string;
  slug?: string;
  content?: string;
};

type FooterConfig = {
  brandDescription: string;
  ecosystemLinks: FooterLink[];
  companyLinks: FooterLink[];
  contact: {
    email: string;
    phone: string;
    location: string;
  };
};

const DEFAULT_CONFIG: FooterConfig = {
  brandDescription: "India & GCC's premier independent food safety and hygiene certification standard. Empowering diners and guests with verifiable trust.",
  ecosystemLinks: [
    { label: "Certified Dining", url: "/search?mode=eat" },
    { label: "Verified Stays", url: "/search?mode=stay" },
    { label: "Verify Certificate", url: "/verify" },
    { label: "Get Certified", url: "/certify" },
  ],
  companyLinks: [
    { label: "About AAHAR", type: "page", slug: "about" },
    { label: "Blog & News", url: "/blog" },
    { label: "Business Listing", url: "/enquiry" },
    { label: "Support & Contact", url: "/enquiry" },
  ],
  contact: {
    email: "contact@aahar.org",
    phone: "+91 800 AAHAR TRUST",
    location: "India & GCC",
  }
};

export default function Footer() {
  const [config, setConfig] = useState<FooterConfig>(DEFAULT_CONFIG);
  const { branding } = useBrandingStore();

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data } = await settingsApi.get("footer_config");
        if (data && (data.brandDescription || (data.ecosystemLinks && data.ecosystemLinks.length > 0))) {
          setConfig({
            brandDescription: data.brandDescription || DEFAULT_CONFIG.brandDescription,
            ecosystemLinks: data.ecosystemLinks?.length ? data.ecosystemLinks : DEFAULT_CONFIG.ecosystemLinks,
            companyLinks: data.companyLinks?.length ? data.companyLinks : DEFAULT_CONFIG.companyLinks,
            contact: {
              email: data.contact?.email || DEFAULT_CONFIG.contact.email,
              phone: data.contact?.phone || DEFAULT_CONFIG.contact.phone,
              location: data.contact?.location || DEFAULT_CONFIG.contact.location,
            }
          });
        }
      } catch (err) {
        // silent fallback to default
      }
    };
    loadConfig();
  }, []);

  const renderLink = (link: FooterLink) => {
    const isPage = link.type === "page";
    const href = isPage ? `/p/${link.slug}` : (link.url || "#");
    return <Link href={href}>{link.label}</Link>;
  };

  return (
    <footer className="w-full relative overflow-hidden">

      {/* Main Footer - The Professional Foundation */}
      <section className="bg-aahar-dark pt-16 pb-8 px-4 relative">

        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">

            {/* Brand Column */}
            <div className="space-y-6">
              {branding?.logoDark || branding?.logoLight ? (
                <img
                  src={getImageUrl(branding.logoDark || branding.logoLight)}
                  alt="AAHAR"
                  className="h-10 max-w-[180px] object-contain"
                />
              ) : (
                <span className="text-4xl font-black tracking-tight text-aahar-teal block">AAHAR</span>
              )}
              <p className="text-[15px] text-white/70 leading-relaxed font-medium">
                {config.brandDescription}
              </p>
            </div>

            {/* Ecosystem Column */}
            <div className="space-y-8 lg:pl-8">
              <h4 className="font-bold text-white uppercase tracking-[0.2em] text-[12px]">Ecosystem</h4>
              <ul className="space-y-5 text-[15px] text-white/60 font-bold">
                {config.ecosystemLinks.map((link, idx) => (
                  <li key={idx} className="hover:text-aahar-teal cursor-pointer transition-colors">
                    {renderLink(link)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div className="space-y-8">
              <h4 className="font-bold text-white uppercase tracking-[0.2em] text-[12px]">Company</h4>
              <ul className="space-y-5 text-[15px] text-white/60 font-bold">
                {config.companyLinks.map((link, idx) => (
                  <li key={idx} className="hover:text-aahar-teal cursor-pointer transition-colors">
                    {renderLink(link)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="space-y-8">
              <h4 className="font-bold text-white uppercase tracking-[0.2em] text-[12px]">Get in Touch</h4>
              <div className="space-y-6">
                {[
                  { Icon: Mail, text: config.contact.email },
                  { Icon: Phone, text: config.contact.phone },
                  { Icon: MapPin, text: config.contact.location },
                ]
                .filter(item => item.text && item.text.trim() !== "")
                .map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-aahar-teal/10 flex items-center justify-center text-aahar-teal group-hover:bg-aahar-teal group-hover:text-white transition-all shrink-0">
                      <item.Icon className="w-5 h-5" />
                    </div>
                    <span className="text-white/80 font-bold text-[13px] group-hover:text-white transition-colors">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright Bar */}
          <div className="pt-10 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 items-center gap-8">
            {/* Left: Socials */}
            <div className="flex justify-center md:justify-start gap-4">
              {[
                { Icon: Facebook, name: "Facebook" },
                { Icon: Twitter, name: "Twitter" },
                { Icon: Instagram, name: "Instagram" },
                { Icon: Linkedin, name: "LinkedIn" }
              ].map(({ Icon, name }, i) => (
                <motion.button 
                  whileHover={{ y: -3, color: "#0A7B7B" }}
                  key={i} 
                  aria-label={name}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30 transition-all border border-white/10"
                >
                  <Icon className="w-4 h-4" />
                </motion.button>
              ))}
            </div>

            {/* Center: Copyright */}
            <div className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              © {new Date().getFullYear()} AAHAR FOUNDATION. WORLDWIDE.
            </div>

            {/* Right: Legal */}
            <div className="flex justify-center md:justify-end gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              <Link href="/p/privacy" className="hover:text-aahar-rose cursor-pointer transition-colors">Privacy</Link>
              <Link href="/p/terms" className="hover:text-aahar-rose cursor-pointer transition-colors">Terms</Link>
              <Link href="/p/security" className="hover:text-aahar-rose cursor-pointer transition-colors">Security</Link>
            </div>
          </div>

        </div>

        {/* Brand Accent Bottom Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-aahar-teal via-aahar-rose to-aahar-teal" />
      </section>
    </footer>
  );
}
