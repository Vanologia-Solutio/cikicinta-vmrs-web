"use client";

import { createQueryClient } from "@/lib/query-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { AppGuard } from "./app-guard";

export default function ClientProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState<QueryClient>(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AppGuard>{children}</AppGuard>
    </QueryClientProvider>
  );
}
