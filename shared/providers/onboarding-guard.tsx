"use client";

import { useAuthStore } from "@/shared/stores/auth-store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { HOME_ROUTE } from "../constants/common";

export function OnboardingGuard() {
  const pathname = usePathname();
  const router = useRouter();

  const { isAuthenticated, user, isInitializing } = useAuthStore();

  useEffect(() => {
    if (isInitializing || !isAuthenticated) return;

    const isOnboarding = pathname === "/onboarding";
    const onboardingDone = user?.metadata.onboardingCompleted;

    if (!onboardingDone && !isOnboarding) {
      router.replace("/onboarding");
    }

    if (onboardingDone && isOnboarding) {
      router.replace(HOME_ROUTE);
    }
  }, [isInitializing, isAuthenticated, user, pathname, router]);

  return null;
}
