"use client";

import React, { useState, Suspense } from "react";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "../components/ui/toast";
import { TopLoader } from "../components/TopLoader";
import { RouteWarmer } from "../components/RouteWarmer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <html lang="en">
      <head>
        <title>Ripple | Create forms people actually enjoy completing</title>
        <meta
          name="description"
          content="Ripple is a modern, premium form-building platform for high-conversion conversational form experiences."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-[#FCFBF8] text-[#191716] antialiased">
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <Suspense fallback={null}>
              <TopLoader />
              <RouteWarmer />
            </Suspense>
            {children}
          </ToastProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
