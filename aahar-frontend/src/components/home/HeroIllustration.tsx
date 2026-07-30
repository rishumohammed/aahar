"use client";

import { motion } from "framer-motion";

// Reusable ease
const ease = [0.22, 1, 0.36, 1];

export function HeroIllustration() {
  return (
    <div className="hidden lg:flex items-center justify-center pb-10 relative w-full max-w-[440px]">
      <svg
        viewBox="0 0 440 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        aria-hidden="true"
        overflow="visible"
      >
        <defs>
          <filter id="cardShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#1A2E2E" floodOpacity="0.07"/>
          </filter>
          <filter id="pillShadow" x="-20%" y="-30%" width="140%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#1A2E2E" floodOpacity="0.06"/>
          </filter>
          {/* Clip checkmark path for draw animation */}
          <clipPath id="checkClip">
            <rect x="195" y="183" width="50" height="40"/>
          </clipPath>
        </defs>

        {/* ── Background circles — slow breathing ── */}
        <motion.circle
          cx="220" cy="210" r="160"
          fill="#0A7B7B" opacity="0.04"
          animate={{ scale: [1, 1.04, 1], opacity: [0.04, 0.07, 0.04] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "220px 210px" }}
        />
        <motion.circle
          cx="220" cy="210" r="118"
          fill="#0A7B7B" opacity="0.04"
          animate={{ scale: [1, 1.06, 1], opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 5, delay: 0.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "220px 210px" }}
        />

        {/* ── Shield — fade + scale in, then gentle float ── */}
        <motion.g
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 0.2, ease },
            scale:   { duration: 0.6, delay: 0.2, ease },
            y:       { duration: 4, delay: 1, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{ transformOrigin: "220px 200px" }}
        >
          {/* Shield shadow */}
          <ellipse cx="220" cy="258" rx="48" ry="7" fill="#0A7B7B" opacity="0.08"/>
          {/* Shield layers */}
          <path
            d="M220 148 L264 166 L264 198 C264 228 244 252 220 260 C196 252 176 228 176 198 L176 166 Z"
            fill="#0A7B7B" opacity="0.1"
          />
          <path
            d="M220 154 L258 170 L258 198 C258 225 240 247 220 255 C200 247 182 225 182 198 L182 170 Z"
            fill="#0A7B7B" opacity="0.18"
          />
          <path
            d="M220 160 L252 175 L252 198 C252 221 236 241 220 249 C204 241 188 221 188 198 L188 175 Z"
            fill="white"
            stroke="#0A7B7B"
            strokeWidth="1.5"
          />

          {/* Checkmark — draws itself in */}
          <motion.path
            d="M207 200 L216 210 L234 190"
            stroke="#0A7B7B"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9, ease }}
          />
        </motion.g>

        {/* ── Restaurant card — slide in from top-left ── */}
        <motion.g
          initial={{ opacity: 0, x: -28, y: -12 }}
          animate={{ opacity: 1, x: 0, y: [0, -5, 0] }}
          transition={{
            opacity: { duration: 0.55, delay: 0.45, ease },
            x:       { duration: 0.55, delay: 0.45, ease },
            y:       { duration: 3.8, delay: 1.2, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <rect x="20" y="60" width="168" height="80" rx="16" fill="white" filter="url(#cardShadow)"/>
          {/* Icon */}
          <circle cx="52" cy="100" r="18" fill="#EAF6F6"/>
          <line x1="47" y1="92" x2="47" y2="108" stroke="#0A7B7B" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M44 92 C44 92 44 97 47 97" stroke="#0A7B7B" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M50 92 L50 97 C50 99 47 99 47 97" stroke="#0A7B7B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="57" y1="92" x2="57" y2="108" stroke="#0A7B7B" strokeWidth="1.8" strokeLinecap="round"/>
          {/* Text bars */}
          <rect x="78" y="88" width="90" height="9" rx="4.5" fill="#1A2E2E" opacity="0.8"/>
          <rect x="78" y="103" width="60" height="7" rx="3.5" fill="#4A6464" opacity="0.35"/>
          {/* Verified dot — pop in */}
          <motion.circle
            cx="155" cy="71" r="7" fill="#0A7B7B"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.85 }}
            style={{ transformOrigin: "155px 71px" }}
          />
          <motion.path
            d="M152 71 L154.5 73.5 L159 68.5"
            stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.35, delay: 1.0, ease }}
          />
        </motion.g>

        {/* ── Hotel card — slide in from bottom-right ── */}
        <motion.g
          initial={{ opacity: 0, x: 28, y: 12 }}
          animate={{ opacity: 1, x: 0, y: [0, -5, 0] }}
          transition={{
            opacity: { duration: 0.55, delay: 0.65, ease },
            x:       { duration: 0.55, delay: 0.65, ease },
            y:       { duration: 4.2, delay: 1.6, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <rect x="252" y="280" width="168" height="80" rx="16" fill="white" filter="url(#cardShadow)"/>
          {/* Icon */}
          <circle cx="284" cy="320" r="18" fill="#EAF6F6"/>
          <rect x="275" y="314" width="18" height="14" rx="2" fill="#0A7B7B" opacity="0.55"/>
          <rect x="278" y="308" width="12" height="8" rx="2" fill="#0A7B7B" opacity="0.35"/>
          <rect x="277" y="318" width="4" height="5" rx="1" fill="white" opacity="0.9"/>
          <rect x="284" y="318" width="4" height="5" rx="1" fill="white" opacity="0.9"/>
          <rect x="280" y="324" width="8" height="4" rx="1" fill="white" opacity="0.9"/>
          {/* Text bars */}
          <rect x="310" y="308" width="90" height="9" rx="4.5" fill="#1A2E2E" opacity="0.8"/>
          <rect x="310" y="323" width="60" height="7" rx="3.5" fill="#4A6464" opacity="0.35"/>
          {/* Verified dot */}
          <motion.circle
            cx="407" cy="291" r="7" fill="#0A7B7B"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 1.05 }}
            style={{ transformOrigin: "407px 291px" }}
          />
          <motion.path
            d="M404 291 L406.5 293.5 L411 288.5"
            stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.35, delay: 1.2, ease }}
          />
        </motion.g>

        {/* ── Certified pill — slide in from right ── */}
        <motion.g
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8, ease }}
        >
          <rect x="280" y="72" width="140" height="38" rx="19" fill="white" filter="url(#pillShadow)"/>
          <circle cx="302" cy="91" r="11" fill="#0A7B7B" opacity="0.1"/>
          <path d="M298 91 L301 94 L307 87" stroke="#0A7B7B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="318" y="85" width="86" height="8" rx="4" fill="#1A2E2E" opacity="0.7"/>
          <rect x="318" y="97" width="58" height="6" rx="3" fill="#0A7B7B" opacity="0.4"/>
        </motion.g>

        {/* ── Audit score pill — slide in from left ── */}
        <motion.g
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.0, ease }}
        >
          <rect x="20" y="288" width="138" height="38" rx="19" fill="white" filter="url(#pillShadow)"/>
          <circle cx="42" cy="307" r="11" fill="#EAF6F6"/>
          <rect x="36" y="304" width="12" height="6" rx="3" fill="#0A7B7B" opacity="0.6"/>
          <rect x="58" y="301" width="84" height="8" rx="4" fill="#1A2E2E" opacity="0.7"/>
          <rect x="58" y="313" width="56" height="6" rx="3" fill="#4A6464" opacity="0.35"/>
        </motion.g>

        {/* ── Connector lines — draw in after cards appear ── */}
        <motion.line
          x1="104" y1="140" x2="188" y2="172"
          stroke="#DDE8E8" strokeWidth="1" strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1, ease }}
        />
        <motion.line
          x1="252" y1="280" x2="234" y2="250"
          stroke="#DDE8E8" strokeWidth="1" strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.3, ease }}
        />
      </svg>
    </div>
  );
}
