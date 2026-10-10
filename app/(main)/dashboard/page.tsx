"use client";

import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";
import { useAuthStore } from "@/shared/stores/auth-store";
import { fullName } from "@/shared/utils/user-formatter";

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <main className={PAGE_ANIMATE_IN}>
      <div className="mb-6">
        <h1 className="mb-1.5 font-heading text-3xl sm:text-4xl">
          Welcome,{" "}
          <strong className="text-primary">
            {fullName(user) || "Unknown User"}
          </strong>
          !
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          You are logged in as{" "}
          <strong className="text-primary">
            {user?.attrs.role.name ?? "Unknown Role"}
          </strong>{" "}
          at{" "}
          <strong className="text-primary">
            {user?.attrs.tenant.name ?? "Unknown Tenant"}
          </strong>
          .
        </p>
      </div>
      <DashboardSummaryCards />
    </main>
  );
}
