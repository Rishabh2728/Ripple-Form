"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { useAuthStore } from "../../stores/auth-store";
import { Button } from "../../components/ui/button";
import { User, Building, LogOut, ArrowLeft, Shield, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, fetchUser, logout } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8]">
        <div className="w-8 h-8 border-4 border-[#6E1F2A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF8]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        <Link href="/dashboard" className="text-xs font-semibold text-[#6E1F2A] hover:underline flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>

        <h1 className="text-3xl font-extrabold text-[#191716] tracking-tight mb-8">Settings & Profile</h1>

        <div className="space-y-6">
          {/* Creator Profile */}
          <div className="bg-white border border-[#E7E2DE] rounded-2xl p-6 shadow-subtle space-y-4">
            <h2 className="text-base font-bold text-[#191716] flex items-center gap-2">
              <User className="w-4 h-4 text-[#6E1F2A]" /> Profile Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold text-[#6F6A67]">Full Name</span>
                <p className="text-sm font-bold text-[#191716] mt-0.5">{user.name}</p>
              </div>
              <div>
                <span className="font-semibold text-[#6F6A67]">Email Address</span>
                <p className="text-sm font-bold text-[#191716] mt-0.5">{user.email}</p>
              </div>
              <div>
                <span className="font-semibold text-[#6F6A67]">Account Created</span>
                <p className="text-sm font-bold text-[#191716] mt-0.5">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Workspace */}
          <div className="bg-white border border-[#E7E2DE] rounded-2xl p-6 shadow-subtle space-y-4">
            <h2 className="text-base font-bold text-[#191716] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#6E1F2A]" /> Workspace Configuration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold text-[#6F6A67]">Active Workspace</span>
                <p className="text-sm font-bold text-[#191716] mt-0.5">{user.workspace_name}</p>
              </div>
              <div>
                <span className="font-semibold text-[#6F6A67]">Workspace ID</span>
                <p className="text-xs font-mono text-[#6F6A67] mt-0.5">{user.workspace_id}</p>
              </div>
            </div>
          </div>

          {/* Future integrations coming soon */}
          <div className="bg-white border border-[#E7E2DE] rounded-2xl p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#191716] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6E1F2A]" /> Webhooks & Integrations
              </h2>
              <span className="text-[10px] font-bold text-[#6F6A67] bg-[#F5F2EF] px-2.5 py-1 rounded-full uppercase">
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-[#6F6A67]">
              Slack, Zapier, HubSpot, and custom webhook dispatch configurations will be available in v2.0.
            </p>
          </div>

          {/* Danger Zone */}
          <div className="pt-4">
            <Button variant="destructive" size="sm" onClick={handleLogout} leftIcon={<LogOut className="w-4 h-4" />}>
              Sign Out of Account
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
