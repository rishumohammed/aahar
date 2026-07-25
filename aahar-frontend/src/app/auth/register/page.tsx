"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShieldCheck, Lock, Mail, User, Phone, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[0-9]{10,14}$/, "Invalid phone number").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setError("");
    try {
      // Register with role default as consumer
      const response = await authApi.register({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
        role: "consumer"
      });

      const { token, user } = response.data.data;
      
      // Save auth state via Zustand store
      useAuthStore.getState().setAuth(user, token);
      
      // Save cookies for middleware redirect verification
      document.cookie = `aahar-token=${token}; path=/; max-age=604800`;
      document.cookie = `aahar-role=${user.role}; path=/; max-age=604800`;

      router.push("/account");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Registration failed. Email might already be taken.");
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

      <Card className="w-full max-w-md bg-white/80 backdrop-blur-xl border-aahar-border shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-6 md:p-10 relative z-10 my-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-aahar-teal/10 rounded-2xl mb-4">
            <ShieldCheck className="h-8 w-8 text-aahar-teal" />
          </div>
          <h1 className="text-3xl font-black text-aahar-dark tracking-tighter uppercase mb-2">Create Account</h1>
          <p className="text-sm font-medium text-aahar-body">Join the AAHAR Hospitality Trust Network</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-aahar-body/60 pl-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-aahar-body/30" />
              <Input 
                type="text" 
                placeholder="John Doe"
                className="pl-11 py-6 rounded-2xl border-aahar-border focus:ring-aahar-teal bg-white text-sm"
                {...register("name")}
              />
            </div>
            {errors.name && <p className="text-xs text-rose-500 font-bold pl-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-aahar-body/60 pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-aahar-body/30" />
              <Input 
                type="email" 
                placeholder="name@company.com"
                className="pl-11 py-6 rounded-2xl border-aahar-border focus:ring-aahar-teal bg-white text-sm"
                {...register("email")}
              />
            </div>
            {errors.email && <p className="text-xs text-rose-500 font-bold pl-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-aahar-body/60 pl-1">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-aahar-body/30" />
              <Input 
                type="text" 
                placeholder="+919876543210"
                className="pl-11 py-6 rounded-2xl border-aahar-border focus:ring-aahar-teal bg-white text-sm"
                {...register("phone")}
              />
            </div>
            {errors.phone && <p className="text-xs text-rose-500 font-bold pl-1">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-aahar-body/60 pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-aahar-body/30" />
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                className="pl-11 pr-11 py-6 rounded-2xl border-aahar-border focus:ring-aahar-teal bg-white text-sm"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-aahar-body/40 hover:text-aahar-teal transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-rose-500 font-bold pl-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-aahar-body/60 pl-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-aahar-body/30" />
              <Input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="••••••••"
                className="pl-11 pr-11 py-6 rounded-2xl border-aahar-border focus:ring-aahar-teal bg-white text-sm"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-aahar-body/40 hover:text-aahar-teal transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-rose-500 font-bold pl-1">{errors.confirmPassword.message}</p>}
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-500 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-aahar-dark text-white rounded-2xl py-6 md:py-7 font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
          >
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                Register Account
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-aahar-body mt-4 font-medium">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-aahar-teal hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
