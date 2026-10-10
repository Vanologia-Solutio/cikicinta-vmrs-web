"use client";

import { FullscreenLoader } from "@/components/general/fullscreen-loader";
import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/shared/stores/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LogoutPage() {
  const { signOut } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        await authService.logout();
      } finally {
        signOut();
        router.replace("/login");
      }
    };
    logout();
  }, [signOut, router]);

  return <FullscreenLoader message="Logging Out" />;
}
