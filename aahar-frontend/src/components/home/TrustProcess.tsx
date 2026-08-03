"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Zap, Users, Search, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CERTIFICATION_STEPS } from "@/lib/constants";

const STEP_ICONS = [Search, Zap, Users, ShieldCheck, Award];

export default function TrustProcess() {
  return (
    <section className="bg-aahar-wash/50 border-y border-aahar-border relative py-12 sm:py-20 md:py-24 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-aahar-teal/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-aahar-rose/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Panel: The Narrative */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-8">
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-aahar-border shadow-sm">
                <ShieldCheck className="w-4 h-4 text-aahar-teal" />
                <span className="text-[10px] font-black uppercase tracking-widest text-aahar-teal">Standard of Excellence</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-aahar-dark leading-tight tracking-tight">
                The Path to <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-aahar-teal to-[#0D9488]">Ultimate Trust</span>
              </h2>
              
              <p className="text-base text-aahar-body leading-relaxed max-w-md">
                We've built the world's most rigorous hospitality audit system. 
                Our 250-point inspection ensures that every meal and stay meets the AAHAR gold standard.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 1 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { label: "Audit Points", value: "250+" },
                { label: "Checklists", value: "14" },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-2xl bg-white border border-aahar-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-xl font-bold text-aahar-teal">{stat.value}</div>
                  <div className="text-[10px] uppercase font-bold text-aahar-body tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 1, y: 0 }}
            >
              <Link href="/certify">
                <Button className="bg-aahar-teal hover:bg-aahar-teal/90 text-white rounded-xl h-14 px-8 text-xs font-black uppercase tracking-wider shadow-lg shadow-aahar-teal/20 group transition-all">
                  Explore Certification
                  <motion.span className="ml-2 inline-block" animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    →
                  </motion.span>
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right Panel: The Process Flow */}
          <div className="lg:col-span-7 xl:col-span-8 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {CERTIFICATION_STEPS.map((step, index) => {
                const Icon = STEP_ICONS[index] || CheckCircle2;
                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 1, scale: 1, y: 0 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`relative p-6 rounded-2xl bg-white border border-aahar-border shadow-sm hover:shadow-xl hover:border-aahar-teal/20 transition-all group ${
                      index === 4 ? "md:col-span-2 lg:col-span-1" : ""
                    }`}
                  >
                    {/* Step Number & Icon */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 rounded-xl bg-aahar-wash flex items-center justify-center group-hover:bg-aahar-teal group-hover:text-white transition-all duration-300">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-3xl font-bold text-aahar-teal/5 group-hover:text-aahar-teal/10 transition-colors">
                        0{step.step}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-aahar-dark text-lg leading-tight group-hover:text-aahar-teal transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-xs text-aahar-body leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Interactive Background Element */}
                    <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-aahar-teal/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                );
              })}
            </div>

            {/* Connecting Connector (Abstract) */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none hidden xl:block" viewBox="0 0 800 400" fill="none">
              <motion.path
                d="M50 100 Q 200 50, 400 100 T 750 100"
                stroke="url(#gradient)"
                strokeWidth="2"
                strokeDasharray="10 10"
                initial={{ pathLength: 1, opacity: 0.1 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0A7B7B" />
                  <stop offset="100%" stopColor="#B5766A" />
                </linearGradient>
              </defs>
            </svg>
          </div>

        </div>
      </div>
    </section>
  );
}
