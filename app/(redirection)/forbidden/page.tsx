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
import { HouseIcon, ShieldSlashIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen animate-in items-center justify-center p-4 duration-500 fade-in lg:px-0 lg:py-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShieldSlashIcon />
          </EmptyMedia>
          <EmptyTitle>403 - Forbidden</EmptyTitle>
          <EmptyDescription>
            You are not allowed to access this page. Please contact your
            administrator if you believe this is a mistake.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => router.push(HOME_ROUTE)}>
            <HouseIcon />
            Go to Dashboard
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
