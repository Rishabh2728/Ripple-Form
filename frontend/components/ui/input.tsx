"use client";

import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-[#191716] uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg transition-colors placeholder:text-[#6F6A67]/60 focus:outline-none focus:ring-2 focus:ring-[#6E1F2A] focus:border-transparent ${
            error ? "border-[#B54747]" : "border-[#E7E2DE] hover:border-[#6F6A67]"
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs font-medium text-[#B54747]">{error}</span>}
        {helperText && !error && <span className="text-xs text-[#6F6A67]">{helperText}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-[#191716] uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg transition-colors placeholder:text-[#6F6A67]/60 focus:outline-none focus:ring-2 focus:ring-[#6E1F2A] focus:border-transparent min-h-[90px] resize-y ${
            error ? "border-[#B54747]" : "border-[#E7E2DE] hover:border-[#6F6A67]"
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs font-medium text-[#B54747]">{error}</span>}
        {helperText && !error && <span className="text-xs text-[#6F6A67]">{helperText}</span>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
