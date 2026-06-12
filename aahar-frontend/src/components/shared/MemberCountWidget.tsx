import { Users, CheckCircle } from "lucide-react";

export function MemberCountWidget() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm border border-aahar-border">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-aahar-teal/10 text-aahar-teal">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-aahar-dark">12,450+</div>
          <div className="text-xs font-medium text-aahar-body">Certified Members</div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-aahar-wash p-3 text-[10px] font-bold text-aahar-teal uppercase tracking-wider">
        <CheckCircle className="h-3 w-3" />
        Trusted by 1M+ Monthly Users
      </div>
    </div>
  );
}
