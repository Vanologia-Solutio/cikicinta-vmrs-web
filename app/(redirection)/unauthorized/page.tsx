"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { HOME_ROUTE } from "@/shared/constants/common";
import { useAuthStore } from "@/shared/stores/auth-store";
import { LockIcon, SignInIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAuthStore();

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      router.replace(HOME_ROUTE);
    }
  }, [isAuthenticated, isInitializing, router]);

  return (
    <div className="flex h-screen animate-in items-center justify-center p-4 duration-500 fade-in lg:px-0 lg:py-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LockIcon />
          </EmptyMedia>
          <EmptyTitle>401 - Unauthorized</EmptyTitle>
          <EmptyDescription>
            You are not authorized to access this page. Please login to
            continue.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button nativeButton={false} render={<Link href="/callback" />}>
            <SignInIcon />
            Go to Login
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
