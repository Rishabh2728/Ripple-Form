"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RippleLogo } from "./RippleLogo";
import { useAuthStore } from "../stores/auth-store";
import { User, LogOut, LayoutDashboard, FileText, Settings, Command, ChevronDown } from "lucide-react";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#E7E2DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand logo & tagline */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <RippleLogo className="w-7 h-7 text-[#6E1F2A]" />
            <span className="font-bold text-lg text-[#191716] tracking-tight group-hover:text-[#6E1F2A] transition-colors">
              Ripple
            </span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-[#6F6A67]">
              <Link
                href="/dashboard"
                className="px-3 py-2 rounded-lg hover:text-[#191716] hover:bg-[#F5F2EF] transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                Forms
              </Link>
              <Link
                href="/templates"
                className="px-3 py-2 rounded-lg hover:text-[#191716] hover:bg-[#F5F2EF] transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                Templates
              </Link>
            </nav>
          )}
        </div>

        {/* Right side user menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E7E2DE] hover:bg-[#F5F2EF] transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#6E1F2A] text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-[#191716] max-w-[120px] truncate">
                  {user.workspace_name || user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6F6A67]" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white border border-[#E7E2DE] rounded-xl shadow-modal py-1.5 z-50"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-[#E7E2DE]">
                    <p className="text-xs font-bold text-[#191716] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#6F6A67] truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#191716] hover:bg-[#F5F2EF]"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#6F6A67]" />
                    Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#191716] hover:bg-[#F5F2EF]"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-[#6F6A67]" />
                    Settings & Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#B54747] hover:bg-[#F7EEF0]"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-[#191716] hover:bg-[#F5F2EF] rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 text-xs font-semibold bg-[#6E1F2A] text-white hover:bg-[#581821] rounded-lg transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
