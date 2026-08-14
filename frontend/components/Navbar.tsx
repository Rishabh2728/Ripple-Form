"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RippleLogo } from "./RippleLogo";
import { useAuthStore } from "../stores/auth-store";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, FileText, Settings, LogOut, ChevronDown, Menu, X, Sparkles, ShoppingBag } from "lucide-react";

export const Navbar: React.FC = () => {
  const router = useRouter();
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

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#E7E2DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand logo & tagline */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              prefetch={true}
              onMouseEnter={() => prefetchRoute("/")}
              className="flex items-center gap-2.5 group"
            >
              <RippleLogo className="w-7 h-7 text-[#6E1F2A]" />
              <span className="font-bold text-lg text-[#191716] tracking-tight group-hover:text-[#6E1F2A] transition-colors">
                Ripple
              </span>
            </Link>

            {user && (
              <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-[#6F6A67]">
                <Link
                  href="/dashboard"
                  prefetch={true}
                  onMouseEnter={() => prefetchRoute("/dashboard")}
                  className="px-3 py-2 rounded-lg hover:text-[#191716] hover:bg-[#F5F2EF] transition-colors flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Forms
                </Link>
                <Link
                  href="/templates"
                  prefetch={true}
                  onMouseEnter={() => prefetchRoute("/templates")}
                  className="px-3 py-2 rounded-lg hover:text-[#191716] hover:bg-[#F5F2EF] transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  Templates
                </Link>
                <Link
                  href="/ai-generator"
                  prefetch={true}
                  onMouseEnter={() => prefetchRoute("/ai-generator")}
                  className="px-3 py-2 rounded-lg hover:text-[#191716] hover:bg-[#F5F2EF] transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-[#6E1F2A]" />
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
                        prefetch={true}
                        onMouseEnter={() => prefetchRoute("/dashboard")}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#191716] hover:bg-[#F5F2EF]"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#6F6A67]" />
                        Dashboard
                      </Link>
                      <Link
                        href="/order"
                        prefetch={true}
                        onMouseEnter={() => prefetchRoute("/order")}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#191716] hover:bg-[#F5F2EF]"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <ShoppingBag className="w-4 h-4 text-[#6F6A67]" />
                        Billing & Orders
                      </Link>
                      <Link
                        href="/settings"
                        prefetch={true}
                        onMouseEnter={() => prefetchRoute("/settings")}
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

                {/* Hamburger Button for Small Screens */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 rounded-lg border border-[#E7E2DE] text-[#191716] hover:bg-[#F5F2EF] md:hidden"
                  aria-label="Open Right Sidebar Navigation"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  prefetch={true}
                  onMouseEnter={() => prefetchRoute("/login")}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#191716] hover:bg-[#F5F2EF] rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  prefetch={true}
                  onMouseEnter={() => prefetchRoute("/register")}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[#6E1F2A] text-white hover:bg-[#581821] rounded-lg transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Right Slide-in Mobile Sidebar Drawer - Placed outside <header> so parent backdrop-blur doesn't make drawer transparent */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="relative z-[9999]">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#191716]/60 backdrop-blur-sm z-[9998] md:hidden"
            />

            {/* Completely Solid Right Sidebar Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 h-full bg-[#FFFFFF] border-l border-[#E7E2DE] shadow-2xl z-[9999] flex flex-col justify-between p-6 md:hidden overflow-y-auto"
              style={{ backgroundColor: "#FFFFFF", opacity: 1, isolation: "isolate" }}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#E7E2DE] pb-4">
                  <div className="flex items-center gap-2">
                    <RippleLogo className="w-6 h-6 text-[#6E1F2A]" />
                    <span className="font-bold text-base text-[#191716]">Ripple</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-[#6F6A67] hover:text-[#191716] hover:bg-[#F5F2EF]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {user && (
                  <div className="px-3.5 py-3 bg-[#F5F2EF] rounded-xl border border-[#E7E2DE]">
                    <p className="text-xs font-bold text-[#191716] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#6F6A67] truncate">{user.email}</p>
                  </div>
                )}

                <nav className="space-y-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#191716] hover:bg-[#F5F2EF] transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#6E1F2A]" />
                    Forms Dashboard
                  </Link>

                  <Link
                    href="/templates"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#191716] hover:bg-[#F5F2EF] transition-colors"
                  >
                    <FileText className="w-4 h-4 text-[#6E1F2A]" />
                    Form Templates
                  </Link>

                  <Link
                    href="/ai-generator"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#191716] hover:bg-[#F5F2EF] transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-[#6E1F2A]" />
                    AI Form Generator
                  </Link>

                  <Link
                    href="/order"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#191716] hover:bg-[#F5F2EF] transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#6E1F2A]" />
                    Orders & Billing
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#191716] hover:bg-[#F5F2EF] transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#6E1F2A]" />
                    Settings & Profile
                  </Link>
                </nav>
              </div>

              {user && (
                <div className="pt-4 border-t border-[#E7E2DE]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#B54747] bg-[#F7EEF0] hover:bg-[#F0C9CD] transition-colors"
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
