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
import { voucherRedemptionQueries } from "@/hooks/use-voucher-redemption";
import { VoucherRedemptionFilters } from "@/shared/types/voucher-redemption";
import { formatSeparator } from "@/shared/utils/formatter";

interface MetricCardProps {
  title: string;
  description: string;
  icon: string;
  value?: number;
  isLoading: boolean;
  isError: boolean;
}

function MetricCard({
  title,
  description,
  icon,
  value,
  isLoading,
  isError,
}: MetricCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <DynamicIcon name={icon} className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription className="truncate">
            {isLoading ? "Loading..." : description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <p className="font-heading text-3xl font-semibold tabular-nums">
            {isError ? "-" : formatSeparator(value ?? 0)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/** Redemption counts over whatever the history table is filtered to. */
export function RedemptionSummaryCards({
  keyword,
  filters,
}: {
  keyword?: string;
  filters: VoucherRedemptionFilters;
}) {
  const { data, isLoading, isError } = voucherRedemptionQueries.useSummary({
    keyword,
    ...filters,
  });
  const summary = data?.data;

  const cards: Omit<MetricCardProps, "isLoading" | "isError">[] = [
    {
      title: "Redeemed",
      description: "Vouchers matching the filters",
      icon: "Ticket",
      value: summary?.totalRedeemed,
    },
    {
      title: "Top category",
      description: summary?.topCategory?.name ?? "No redemptions",
      icon: "Tag",
      value: summary?.topCategory?.count,
    },
    {
      title: "Top benefit",
      description: summary?.topBenefit?.name ?? "No redemptions",
      icon: "Gift",
      value: summary?.topBenefit?.count,
    },
  ];

  return (
    <div className="mb-4 grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <MetricCard
          key={card.title}
          {...card}
          isLoading={isLoading}
          isError={isError}
        />
      ))}
    </div>
  );
}
