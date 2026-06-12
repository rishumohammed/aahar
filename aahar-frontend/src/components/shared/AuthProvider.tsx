"use client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect } from "react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuth(); // validates token + reconnects socket on every page mount
  return <>{children}</>;
}
