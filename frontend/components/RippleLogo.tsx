import React from "react";

export function RippleLogo({ className = "w-7 h-7 text-[#6E1F2A]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Dynamic concentric wave ripple mark */}
      <path d="M12 3a9 9 0 0 0-9 9" />
      <path d="M12 7a5 5 0 0 0-5 5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 17a5 5 0 0 0 5-5" />
      <path d="M12 21a9 9 0 0 0 9-9" />
    </svg>
  );
}
