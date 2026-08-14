"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { RippleLogo } from "./RippleLogo";
import { useAuthStore } from "../stores/auth-store";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, FileText, Settings, LogOut, ChevronDown, Menu, X, Sparkles, ShoppingBag } from "lucide-react";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push("/login");
  };

  const prefetchRoute = (path: string) => {
    router.prefetch(path);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#FCFBF7]/95 backdrop-blur-md border-b-2 border-[#E6DFD5] py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-between">
          {/* Brand logo & main nav */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              prefetch={true}
              onMouseEnter={() => prefetchRoute("/")}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#6E1F2A] flex items-center justify-center text-white shadow-sm border border-[#541720] group-hover:scale-105 transition-transform">
                <RippleLogo className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl text-[#1C1917] tracking-tight group-hover:text-[#6E1F2A] transition-colors">
                Ripple
              </span>
            </Link>

            {user && (
              <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold text-[#78716C]">
                <Link
                  href="/dashboard"
                  prefetch={true}
                  onMouseEnter={() => prefetchRoute("/dashboard")}
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 border ${
                    isActive("/dashboard")
                      ? "bg-[#F9EFEF] text-[#6E1F2A] border-[#F0C9CD] shadow-sm font-extrabold"
                      : "border-transparent hover:text-[#1C1917] hover:bg-[#F6F3ED] hover:border-[#E6DFD5]"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-[#6E1F2A]" />
                  Forms
                </Link>
                <Link
                  href="/templates"
                  prefetch={true}
                  onMouseEnter={() => prefetchRoute("/templates")}
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 border ${
                    isActive("/templates")
                      ? "bg-[#F9EFEF] text-[#6E1F2A] border-[#F0C9CD] shadow-sm font-extrabold"
                      : "border-transparent hover:text-[#1C1917] hover:bg-[#F6F3ED] hover:border-[#E6DFD5]"
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#6E1F2A]" />
                  Templates
                </Link>
                <Link
                  href="/ai-generator"
                  prefetch={true}
                  onMouseEnter={() => prefetchRoute("/ai-generator")}
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 border ${
                    isActive("/ai-generator")
                      ? "bg-[#F9EFEF] text-[#6E1F2A] border-[#F0C9CD] shadow-sm font-extrabold"
                      : "border-transparent hover:text-[#1C1917] hover:bg-[#F6F3ED] hover:border-[#E6DFD5]"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#6E1F2A] animate-pulse" />
                  AI Generator
                </Link>
              </nav>
            )}
          </div>

          {/* Right side user menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative flex items-center gap-2">
                <div className="hidden sm:block relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 border-[#E6DFD5] bg-white hover:border-[#6E1F2A] transition-all shadow-xs"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#6E1F2A] text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-xs font-extrabold text-[#1C1917] max-w-[130px] truncate">
                      {user.workspace_name || user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-60 bg-white border-2 border-[#E6DFD5] rounded-2xl shadow-xl py-1.5 z-50 overflow-hidden"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5 bg-[#F9EFEF] border-b border-[#F0C9CD]">
                        <p className="text-xs font-extrabold text-[#6E1F2A] truncate">{user.name}</p>
                        <p className="text-[11px] text-[#78716C] truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        prefetch={true}
                        onMouseEnter={() => prefetchRoute("/dashboard")}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#1C1917] hover:bg-[#F6F3ED] transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#6E1F2A]" />
                        Forms Dashboard
                      </Link>
                      <Link
                        href="/order"
                        prefetch={true}
                        onMouseEnter={() => prefetchRoute("/order")}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#1C1917] hover:bg-[#F6F3ED] transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <ShoppingBag className="w-4 h-4 text-[#6E1F2A]" />
                        Billing & Orders
                      </Link>
                      <Link
                        href="/settings"
                        prefetch={true}
                        onMouseEnter={() => prefetchRoute("/settings")}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#1C1917] hover:bg-[#F6F3ED] transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4 text-[#6E1F2A]" />
                        Settings & Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#B54747] hover:bg-[#F9EFEF] transition-colors border-t border-[#E6DFD5]"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>

                {/* Hamburger Button for Small Screens */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 rounded-xl border-2 border-[#E6DFD5] bg-white text-[#1C1917] hover:border-[#6E1F2A] md:hidden transition-all"
                  aria-label="Open Mobile Menu Drawer"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  prefetch={true}
                  onMouseEnter={() => prefetchRoute("/login")}
                  className="px-4 py-2 text-xs font-bold text-[#1C1917] hover:text-[#6E1F2A] hover:bg-[#F6F3ED] rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  prefetch={true}
                  onMouseEnter={() => prefetchRoute("/register")}
                  className="crayon-button px-4 py-2 text-xs font-extrabold bg-[#6E1F2A] text-white hover:bg-[#541720] rounded-xl transition-colors shadow-sm"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Right Slide-in Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="relative z-[9999]">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#1C1917]/60 backdrop-blur-sm z-[9998] md:hidden"
            />

            {/* Completely Solid Right Sidebar Drawer with Paper Sketched Card Styling */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 h-full bg-[#FCFBF7] border-l-2 border-[#E6DFD5] shadow-2xl z-[9999] flex flex-col justify-between p-6 md:hidden overflow-y-auto"
              style={{ backgroundColor: "#FCFBF7", opacity: 1, isolation: "isolate" }}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-[#E6DFD5] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#6E1F2A] flex items-center justify-center text-white font-bold">
                      <RippleLogo className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-extrabold text-lg text-[#1C1917]">Ripple</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl text-[#78716C] hover:text-[#1C1917] hover:bg-[#F6F3ED] border border-[#E6DFD5]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {user && (
                  <div className="px-4 py-3 bg-[#F9EFEF] rounded-2xl border border-[#F0C9CD]">
                    <p className="text-xs font-extrabold text-[#6E1F2A] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#78716C] truncate">{user.email}</p>
                  </div>
                )}

                <nav className="space-y-1.5">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-extrabold text-[#1C1917] hover:bg-[#F6F3ED] transition-colors border border-transparent hover:border-[#E6DFD5]"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#6E1F2A]" />
                    Forms Dashboard
                  </Link>

                  <Link
                    href="/templates"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-extrabold text-[#1C1917] hover:bg-[#F6F3ED] transition-colors border border-transparent hover:border-[#E6DFD5]"
                  >
                    <FileText className="w-4 h-4 text-[#6E1F2A]" />
                    Form Templates
                  </Link>

                  <Link
                    href="/ai-generator"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-extrabold text-[#1C1917] hover:bg-[#F6F3ED] transition-colors border border-transparent hover:border-[#E6DFD5]"
                  >
                    <Sparkles className="w-4 h-4 text-[#6E1F2A]" />
                    AI Form Generator
                  </Link>

                  <Link
                    href="/order"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-extrabold text-[#1C1917] hover:bg-[#F6F3ED] transition-colors border border-transparent hover:border-[#E6DFD5]"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#6E1F2A]" />
                    Orders & Billing
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-extrabold text-[#1C1917] hover:bg-[#F6F3ED] transition-colors border border-transparent hover:border-[#E6DFD5]"
                  >
                    <Settings className="w-4 h-4 text-[#6E1F2A]" />
                    Settings & Profile
                  </Link>
                </nav>
              </div>

              {user && (
                <div className="pt-4 border-t-2 border-[#E6DFD5]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-extrabold text-[#B54747] bg-[#F9EFEF] hover:bg-[#F0C9CD] transition-colors border border-[#F0C9CD]"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
