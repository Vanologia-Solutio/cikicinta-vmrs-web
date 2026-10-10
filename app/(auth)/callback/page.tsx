"use client";

import { FullscreenLoader } from "@/components/general/fullscreen-loader";
import { HOME_ROUTE } from "@/shared/constants/common";
import { useAuthStore } from "@/shared/stores/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CallbackPage() {
  const router = useRouter();
  const { isAuthenticated, isInitializing, user } = useAuthStore();

  useEffect(() => {
    if (isInitializing) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user?.metadata.onboardingCompleted) {
      router.replace(HOME_ROUTE);
    } else {
      router.replace("/onboarding");
    }
  }, [isInitializing, isAuthenticated, user, router]);

  return <FullscreenLoader message="Authenticating callback" />;
}
