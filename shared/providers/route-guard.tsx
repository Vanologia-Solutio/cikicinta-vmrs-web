"use client";

import { useAuthStore } from "@/shared/stores/auth-store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { PUBLIC_ROUTES } from "../constants/common";
import { extractAllowedPaths, hasMenuAccess } from "../helpers/menu";

export function RouteGuard() {
  const pathname = usePathname();
  const router = useRouter();

  const { isAuthenticated, accessibleMenus, isInitializing } = useAuthStore();

  const allowedPaths = useMemo(
    () => extractAllowedPaths(accessibleMenus),
    [accessibleMenus],
  );

  useEffect(() => {
    if (isInitializing) return;

    const isPublic = PUBLIC_ROUTES.includes(pathname);

    if (!isAuthenticated && !isPublic) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && !isPublic) {
      if (!hasMenuAccess(pathname, allowedPaths)) {
        router.replace("/forbidden");
        return;
      }
    }
  }, [isInitializing, isAuthenticated, pathname, router, allowedPaths]);

  return null;
}
