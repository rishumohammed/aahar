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
  active:    { ring: "border-aahar-teal",  dot: "bg-aahar-teal",  label: "Certified" },
  expiring:  { ring: "border-amber-500",   dot: "bg-amber-500",   label: "Expiring soon" },
  expired:   { ring: "border-rose-500",    dot: "bg-rose-500",    label: "Expired" },
  suspended: { ring: "border-rose-500",    dot: "bg-rose-500/60", label: "Suspended" },
  revoked:   { ring: "border-aahar-body/40", dot: "bg-aahar-body/40", label: "Revoked" },
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
  const borderColor = isAccommodation ? "border-aahar-rose" : styles.ring;
  const logoColor   = isAccommodation ? "text-aahar-rose"   : "text-aahar-teal";

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
        : "badge bg-rose-50 text-rose-600 border border-rose-200";
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
        className={`inline-flex flex-col items-center border-[1.5px] rounded-xl bg-white
                    ${borderColor} ${sizes[size]}`}
      >
        <span className={`font-bold tracking-[0.12em] ${logoSizes[size]} ${logoColor}`}>
          AAHAR
        </span>
        <span className={`tracking-wider text-aahar-body/60 ${subSizes[size]}`}>
          {isAccommodation ? "ACCOMMODATION" : "CERTIFIED"}
        </span>
        {isAccommodation && starRating ? (
          <span className="text-aahar-rose text-[9px]">{"★".repeat(starRating)}</span>
        ) : (
          <span className={`${subSizes[size]} text-aahar-rose`}>{certYear}</span>
        )}
      </div>
    );
  }

  // ── Widget variant (sidebar / profile page) ──────────
  return (
    <div
      className={`border-2 rounded-xl p-4 text-center
                  ${isAccommodation ? "border-aahar-rose/40 bg-aahar-rose/5" : "border-aahar-teal/40 bg-aahar-teal/5"}`}
    >
      <div className="text-[10px] text-aahar-body/60 tracking-widest uppercase mb-1 font-bold">
        {isAccommodation ? "AAHAR Accommodation" : "AAHAR Certification"}
      </div>
      <div className={`text-xl font-bold tracking-[0.15em] ${logoColor}`}>AAHAR</div>

      {isAccommodation && starRating ? (
        <div className="flex justify-center gap-0.5 my-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-base ${i < starRating ? "text-amber-400" : "text-aahar-border"}`}
            >
              ★
            </span>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center gap-1.5 my-1">
          <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
          <span className="text-[10px] font-bold text-aahar-body/70">{styles.label}</span>
        </div>
      )}

      {expiresAt && (
        <div className="text-[10px] text-aahar-body/60 mt-1">
          Valid until {new Date(expiresAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
        </div>
      )}
      {certNumber && (
        <div className="text-[10px] text-aahar-rose mt-1 font-mono font-bold">{certNumber}</div>
      )}
    </div>
  );
}
