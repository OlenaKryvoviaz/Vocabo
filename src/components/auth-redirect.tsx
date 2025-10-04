"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Client component that handles redirect after successful authentication
 * This component monitors the user authentication state and redirects
 * authenticated users to the dashboard only from the home page
 */
export function AuthRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only proceed if Clerk has finished loading
    if (!isLoaded) return;

    // Only redirect to dashboard if user is authenticated AND on the home page
    // This allows authenticated users to visit other pages like /pricing
    if (user && pathname === "/") {
      router.push("/dashboard");
    }
  }, [user, isLoaded, router, pathname]);

  // This component doesn't render anything visible
  return null;
}
