"use client";

import { DynamicIcon } from "@/components/general/icon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { menuQueries } from "@/hooks/use-menu";
import { roleQueries } from "@/hooks/use-role";
import { tenantQueries } from "@/hooks/use-tenant";
import { userQueries } from "@/hooks/use-user";
import { hasMenuAccess, extractAllowedPaths } from "@/shared/helpers/menu";
import { useAuthStore } from "@/shared/stores/auth-store";
import Link from "next/link";

// Only the total is needed, so ask for a single row.
const COUNT_QUERY = { pageIndex: 0, pageSize: 1, keyword: "" };

interface SummaryCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  total?: number;
  isLoading: boolean;
  isError: boolean;
}

function SummaryCard({
  title,
  description,
  icon,
  href,
  total,
  isLoading,
  isError,
}: SummaryCardProps) {
  return (
    <Link href={href}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <DynamicIcon name={icon} className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription className="truncate">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <p className="font-heading text-3xl font-semibold tabular-nums">
              {isError ? "-" : (total ?? 0)}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function DashboardSummaryCards() {
  const accessibleMenus = useAuthStore((s) => s.accessibleMenus);
  const allowedPaths = extractAllowedPaths(accessibleMenus);

  const users = userQueries.useList(COUNT_QUERY);
  const roles = roleQueries.useList(COUNT_QUERY);
  const tenants = tenantQueries.useList(COUNT_QUERY);
  const menus = menuQueries.useList(COUNT_QUERY);

  const cards = [
    {
      title: "Users",
      description: "Registered accounts",
      icon: "Users",
      href: "/platform/access-management/users",
      query: users,
    },
    {
      title: "Roles",
      description: "Access roles",
      icon: "Lock",
      href: "/platform/access-management/roles",
      query: roles,
    },
    {
      title: "Tenants",
      description: "Offices and outlets",
      icon: "Buildings",
      href: "/platform/system-configuration/tenants",
      query: tenants,
    },
    {
      title: "Menus",
      description: "Navigation entries",
      icon: "List",
      href: "/platform/system-configuration/menus",
      query: menus,
    },
    // Only link to the screens this user can open.
  ].filter((card) => hasMenuAccess(card.href, allowedPaths));

  if (cards.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ query, ...card }) => (
        <SummaryCard
          key={card.title}
          {...card}
          total={query.data?.pagination?.totalRecords}
          isLoading={query.isLoading}
          isError={query.isError}
        />
      ))}
    </div>
  );
}
