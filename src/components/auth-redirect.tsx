"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Client component that handles redirect after successful authentication
 * This component monitors the user authentication state and redirects
 * authenticated users to the dashboard
 */
export function AuthRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Only proceed if Clerk has finished loading
    if (!isLoaded) return;

    // If user is authenticated, redirect to dashboard
    if (user) {
      router.push("/dashboard");
    }
  }, [user, isLoaded, router]);

  // This component doesn't render anything visible
  return null;
}
