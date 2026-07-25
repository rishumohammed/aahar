import { Users, CheckCircle } from "lucide-react";

export function MemberCountWidget() {
  return (
    <div className="rounded-2xl sm:rounded-3xl bg-white p-6 shadow-sm border border-aahar-border hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-aahar-teal/10 text-aahar-teal">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-extrabold text-aahar-dark tracking-tight">12,450+</div>
          <div className="text-xs font-semibold text-aahar-body/70">Certified Members</div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-aahar-wash p-3 text-[10px] font-black text-aahar-teal uppercase tracking-widest">
        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
        Trusted by 1M+ Monthly Users
      </div>
    </div>
  );
}
