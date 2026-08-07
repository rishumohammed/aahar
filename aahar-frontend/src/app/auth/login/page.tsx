"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { ShieldCheck, Lock, Mail, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn, getImageUrl } from "@/lib/utils";
import { useBrandingStore } from "@/store/brandingStore";

const ROLE_REDIRECT: Record<string, string> = {
  super_admin: "/admin/dashboard",
  admin: "/admin/dashboard",
  auditor: "/auditor/dashboard",
  owner: "/owner/dashboard",
  manager: "/manager/dashboard",
  consumer: "/",
};

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const { branding } = useBrandingStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(email, password);
      const token = useAuthStore.getState().token;
      document.cookie = `aahar-token=${token}; path=/; max-age=604800`;
      document.cookie = `aahar-role=${user.role}; path=/; max-age=604800`;

      const redirect = params.get("redirect");
      router.push(redirect ?? ROLE_REDIRECT[user.role] ?? "/");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-aahar-wash flex flex-col items-center justify-center py-12 px-4 sm:px-6 relative overflow-y-auto overflow-x-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-aahar-teal/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-aahar-rose/5 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md bg-white/80 backdrop-blur-xl border-aahar-border shadow-xl rounded-xl p-6 md:p-10 relative z-10 my-auto">
        <div className="text-center mb-8">
          {branding?.logoLight ? (
            <div className="flex justify-center mb-4">
              <img src={getImageUrl(branding.logoLight)} alt="AAHAR" className="h-12 max-w-[200px] object-contain" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl mb-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-aahar-border/50 group-hover:rotate-12 transition-transform">
              <span className="text-aahar-teal font-black text-3xl">A</span>
            </div>
          )}
          <h1 className="text-3xl font-black text-aahar-dark tracking-tighter uppercase mb-2">Welcome Back</h1>
          <p className="text-sm font-medium text-aahar-body">Secure access to AAHAR Trust Network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-aahar-body/60 pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-aahar-body/30" />
              <Input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="pl-11 py-6 rounded-2xl border-aahar-border focus:ring-aahar-teal bg-white text-sm"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-aahar-body/60 pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-aahar-body/30" />
              <Input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-11 pr-11 py-6 rounded-2xl border-aahar-border focus:ring-aahar-teal bg-white text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-aahar-body/40 hover:text-aahar-teal transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-500 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-aahar-dark text-white rounded-2xl py-6 md:py-7 font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                Sign In to Portal
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>

          <div className="text-center text-sm font-medium text-aahar-body/70 mt-6">
            Don't have an account?{" "}
            <Link href="/auth/register" className="font-bold text-aahar-teal hover:text-aahar-teal/80 transition-colors">
              Sign up here
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

