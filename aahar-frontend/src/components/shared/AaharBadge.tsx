import { ShieldCheck } from "lucide-react";
import type { CertStatus, CertType } from "@/types";

interface Props {
  type?: CertType;
  status?: CertStatus;
  starRating?: 1 | 2 | 3 | 4 | 5;
  expiresAt?: string;
  certNumber?: string;
  size?: "sm" | "md" | "lg";
  variant?: "badge" | "widget" | "inline";
}

const STATUS_STYLES: Record<CertStatus, { ring: string; dot: string; label: string }> = {
  active:    { ring: "border-teal-400",  dot: "bg-teal-400",  label: "Certified" },
  expiring:  { ring: "border-warning",   dot: "bg-warning",   label: "Expiring soon" },
  expired:   { ring: "border-error",     dot: "bg-error",     label: "Expired" },
  suspended: { ring: "border-error",     dot: "bg-error/60",  label: "Suspended" },
  revoked:   { ring: "border-mid",       dot: "bg-mid",       label: "Revoked" },
};

export default function AaharBadge({
  type = "fnb",
  status = "active",
  starRating,
  expiresAt,
  certNumber,
  size = "md",
  variant = "badge",
}: Props) {
  const styles = STATUS_STYLES[status];
  const isAccommodation = type === "accommodation";
  const borderColor = isAccommodation ? "border-rose-400" : styles.ring;
  const logoColor   = isAccommodation ? "text-rose-400"   : "text-teal-400";

  const certYear = expiresAt
    ? new Date(expiresAt).getFullYear().toString()
    : new Date().getFullYear().toString();

  // ── Inline chip variant ──────────────────────────────
  if (variant === "inline") {
    const chip =
      status === "active"
        ? "badge-cert"
        : status === "expiring"
        ? "badge-pending"
        : "badge bg-error-bg text-error border border-error/30";
    return (
      <span className={chip}>
        <ShieldCheck size={10} />
        AAHAR {isAccommodation ? "Accommodation" : "Certified"}
      </span>
    );
  }

  // ── Compact badge (card use) ─────────────────────────
  if (variant === "badge") {
    const sizes = {
      sm: "px-2 py-1 gap-1",
      md: "px-2.5 py-1.5 gap-1.5",
      lg: "px-3 py-2 gap-2",
    };
    const logoSizes = { sm: "text-[9px]", md: "text-xs", lg: "text-sm" };
    const subSizes  = { sm: "text-[7px]", md: "text-[8px]", lg: "text-[9px]" };

    return (
      <div
        className={`inline-flex flex-col items-center border-[1.5px] rounded-lg bg-white
                    ${borderColor} ${sizes[size]}`}
      >
        <span className={`font-bold tracking-[0.12em] ${logoSizes[size]} ${logoColor}`}>
          AAHAR
        </span>
        <span className={`tracking-wider text-mid ${subSizes[size]}`}>
          {isAccommodation ? "ACCOMMODATION" : "CERTIFIED"}
        </span>
        {isAccommodation && starRating ? (
          <span className="text-rose-400 text-[9px]">{"★".repeat(starRating)}</span>
        ) : (
          <span className={`${subSizes[size]} text-rose-400`}>{certYear}</span>
        )}
      </div>
    );
  }

  // ── Widget variant (sidebar / profile page) ──────────
  return (
    <div
      className={`border-2 rounded-xl p-3 text-center
                  ${isAccommodation ? "border-rose-400 bg-rose-50" : "border-teal-400 bg-teal-50"}`}
    >
      <div className="text-2xs text-mid tracking-widest uppercase mb-1">
        {isAccommodation ? "AAHAR Accommodation" : "AAHAR Certification"}
      </div>
      <div className={`text-xl font-bold tracking-[0.15em] ${logoColor}`}>AAHAR</div>

      {isAccommodation && starRating ? (
        <div className="flex justify-center gap-0.5 my-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-base ${i < starRating ? "text-teal-400" : "text-border"}`}
            >
              ★
            </span>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center gap-1.5 my-1">
          <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
          <span className="text-2xs text-mid">{styles.label}</span>
        </div>
      )}

      {expiresAt && (
        <div className="text-2xs text-mid">
          Valid until {new Date(expiresAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
        </div>
      )}
      {certNumber && (
        <div className="text-[9px] text-rose-400 mt-0.5 font-mono">{certNumber}</div>
      )}
    </div>
  );
}
