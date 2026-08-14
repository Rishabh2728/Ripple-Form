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
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.register({ name, email, password });
      setAuth(res.user, res.access_token);
      success("Account created successfully!");
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : "Registration failed.";
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
          <h2 className="text-2xl font-extrabold text-[#191716] tracking-tight">Create your creator account</h2>
          <p className="text-xs text-[#6F6A67] mt-1">Start building high-conversion forms in under 2 minutes.</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-[#F7EEF0] border border-[#B54747]/30 rounded-lg text-xs text-[#B54747] font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Morgan"
          />

          <Input
            label="Work Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@company.com"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
          />

          <Button type="submit" isLoading={loading} className="w-full mt-2" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Create Creator Account
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#E7E2DE] text-center text-xs text-[#6F6A67]">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#6E1F2A] hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
