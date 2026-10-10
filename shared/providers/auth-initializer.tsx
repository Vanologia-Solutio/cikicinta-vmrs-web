"use client";

import { useAuthStore } from "@/shared/stores/auth-store";
import { useEffect } from "react";

export function AuthInitializer() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}
