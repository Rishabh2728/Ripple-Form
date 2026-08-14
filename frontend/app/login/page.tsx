"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../stores/auth-store";
import { api, ApiError } from "../../lib/api-client";
import { useToast } from "../../components/ui/toast";
import { RippleLogo } from "../../components/RippleLogo";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState("demo@ripple.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      setAuth(res.user, res.access_token);
      success(`Welcome back, ${res.user.name}!`);
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : "Failed to sign in.";
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8] p-4">
      <div className="w-full max-w-md bg-white border border-[#E7E2DE] rounded-2xl shadow-card p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <RippleLogo className="w-8 h-8 text-[#6E1F2A]" />
            <span className="font-bold text-xl text-[#191716]">Ripple</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-[#191716] tracking-tight">Sign in to your creator workspace</h2>
          <p className="text-xs text-[#6F6A67] mt-1">Access your forms, builder, and real-time response analytics.</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-[#F7EEF0] border border-[#B54747]/30 rounded-lg text-xs text-[#B54747] font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" isLoading={loading} className="w-full mt-2" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#E7E2DE] text-center text-xs text-[#6F6A67]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-[#6E1F2A] hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
