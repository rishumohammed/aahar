"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Instagram, Twitter, Linkedin, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { settingsApi } from "@/lib/api";

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
  brandDescription: "Aahar Foundation is committed to bringing transparency and standardisation to the hospitality sector globally.",
  ecosystemLinks: [
    { label: "Restaurants", type: "url", url: "/search?type=restaurant" },
    { label: "Hotels", type: "url", url: "/search?type=hotel" },
    { label: "Get Certified", type: "url", url: "/apply" },
  ],
  companyLinks: [
    { label: "About Us", type: "url", url: "/about" },
    { label: "Contact", type: "url", url: "/contact" },
    { label: "Blog", type: "url", url: "/blog" },
  ],
  contact: {
    email: "support@aahar.example.com",
    phone: "+91 90000 00000",
    location: "New Delhi, India",
  }
};

export default function Footer() {
  const [config, setConfig] = useState<FooterConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data } = await settingsApi.get("footer_config");
        if (data) {
          setConfig(data);
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
              <span className="text-4xl font-bold tracking-tight text-aahar-teal block">AAHAR</span>
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
                ].map((item, i) => (
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
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <motion.button 
                  whileHover={{ y: -3, color: "#0A7B7B" }}
                  key={i} 
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
              <span className="hover:text-aahar-rose cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-aahar-rose cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-aahar-rose cursor-pointer transition-colors">Security</span>
            </div>
          </div>

        </div>

        {/* Brand Accent Bottom Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-aahar-teal via-aahar-rose to-aahar-teal" />
      </section>
    </footer>
  );
}
