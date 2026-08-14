"use client";

import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "draft" | "published" | "archived" | "info" | "neutral";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "neutral", className = "" }) => {
  const variantStyles = {
    draft: "bg-[#F5F2EF] text-[#6F6A67] border-[#E7E2DE]",
    published: "bg-[#E6F4ED] text-[#2F7D5B] border-[#B7E2CE]",
    archived: "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]",
    info: "bg-[#EBF3FA] text-[#41658A] border-[#CBE0F1]",
    neutral: "bg-[#F5F2EF] text-[#191716] border-[#E7E2DE]",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
