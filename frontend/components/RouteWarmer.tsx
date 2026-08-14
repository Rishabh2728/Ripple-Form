"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RouteWarmer() {
  const router = useRouter();

  useEffect(() => {
    // Warm up and prefetch all primary app routes in the background
    const routes = [
      "/dashboard",
      "/templates",
      "/ai-generator",
      "/order",
      "/settings",
      "/shortcuts",
      "/login",
      "/register"
    ];

    routes.forEach((route) => {
      try {
        router.prefetch(route);
      } catch (err) {
        // Ignore prefetch failures
      }
    });
  }, [router]);

  return null;
}
