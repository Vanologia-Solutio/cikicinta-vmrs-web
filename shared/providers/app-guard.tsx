"use client";

import { FullscreenLoader } from "@/components/general/fullscreen-loader";
import { useAuthStore } from "@/shared/stores/auth-store";
import { usePathname } from "next/navigation";
import { Fragment, ReactNode } from "react";
import { PUBLIC_ROUTES } from "../constants/common";
import { AuthInitializer } from "./auth-initializer";
import { OnboardingGuard } from "./onboarding-guard";
import { RouteGuard } from "./route-guard";

export function AppGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isInitializing } = useAuthStore();

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  return (
    <Fragment>
      <AuthInitializer />
      <RouteGuard />
      <OnboardingGuard />

      {isInitializing && !isPublic ? (
        <FullscreenLoader message="Discovering Session" />
      ) : (
        children
      )}
    </Fragment>
  );
}
