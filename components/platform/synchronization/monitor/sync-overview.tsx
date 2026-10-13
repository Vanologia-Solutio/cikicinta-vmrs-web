"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { syncQueries } from "@/hooks/use-sync";
import { errorMessage, notify } from "@/lib/toast";
import {
  SyncDirection,
  SyncDirectionState,
  SyncHealth,
  SyncHubDelivery,
} from "@/shared/types/sync";
import { formatSeparator, formatTag } from "@/shared/utils/formatter";
import {
  CloudSlashIcon,
  PlayIcon,
  PowerIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { BATCHES_PATH } from "@/components/operational/voucher-management/batches/voucher-batches-table";
import Link from "next/link";
import { SyncStatusBadge } from "../sync-status-badge";

const DIRECTIONS: {
  direction: SyncDirection;
  title: string;
  description: string;
}[] = [
  {
    direction: "publish",
    title: "Sending",
    description: "Events recorded here, on their way to the hub.",
  },
  {
    direction: "pull",
    title: "Receiving",
    description: "Events from other sites, applied here.",
  },
  {
    direction: "cleanup",
    title: "Cleanup",
    description: "Removal of events that are finished with.",
  },
];

const formatTime = (value: string | null) =>
  value ? format(new Date(value), "dd MMM yyyy HH:mm:ss") : "Never";

/** Turns a run's counters into one line, e.g. "published 3, failed 0". */
const summarise = (result: Record<string, number>) =>
  Object.entries(result)
    .map(([key, value]) => `${formatTag(key).toLowerCase()} ${value}`)
    .join(", ");

function DirectionCard({
  direction,
  title,
  description,
  state,
  disabled,
}: (typeof DIRECTIONS)[number] & {
  state?: SyncDirectionState;
  disabled: boolean;
}) {
  const { mutateAsync: run, isPending } = syncQueries.useRun();

  const handleRun = async () => {
    try {
      const res = await run(direction);
      notify.success(`${title} ran`, { description: summarise(res.data) });
    } catch (error) {
      notify.error(`${title} could not run`, {
        description: errorMessage(error),
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{title}</CardTitle>
          <SyncStatusBadge status={state?.status ?? "unknown"} />
        </div>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || isPending}
            onClick={handleRun}
          >
            <PlayIcon />
            {isPending ? "Running..." : "Run now"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-1 text-sm">
          <Row
            label="Last success"
            value={formatTime(state?.lastSuccessAt ?? null)}
          />
          <Row
            label="Last attempt"
            value={formatTime(state?.lastAttemptAt ?? null)}
          />
          <Row
            label="Handled in last run"
            value={String(state?.lastRunCount ?? 0)}
          />
          {!!state?.consecutiveFailures && (
            <Row
              label="Failures in a row"
              value={String(state.consecutiveFailures)}
            />
          )}
        </dl>
        {state?.lastError && (
          <p className="mt-2 break-words text-xs text-destructive">
            {state.lastError}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function CountCard({
  title,
  description,
  counts,
}: {
  title: string;
  description: string;
  counts: { status: string; total: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {counts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing to show.</p>
        ) : (
          <ul className="grid gap-1.5">
            {counts.map(({ status, total }) => (
              <li key={status} className="flex items-center justify-between">
                <SyncStatusBadge status={status} />
                <span className="font-medium tabular-nums">
                  {formatSeparator(total)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

const deliveriesOf = (
  deliveries: SyncHubDelivery[] | null,
  direction: SyncHubDelivery["direction"],
) =>
  (deliveries ?? [])
    .filter((delivery) => delivery.direction === direction)
    .map(({ status, total }) => ({ status, total }));

function Banner({ health }: { health: SyncHealth }) {
  if (!health.enabled) {
    return (
      <Alert>
        <PowerIcon />
        <AlertTitle>Synchronization is switched off</AlertTitle>
        <AlertDescription>
          Nothing is being sent or received at this site. It is turned on with
          SYNC_ENABLED in the API’s environment.
        </AlertDescription>
      </Alert>
    );
  }
  if (!health.tenantId) {
    return (
      <Alert variant="destructive">
        <WarningCircleIcon />
        <AlertTitle>This site has no tenant configured</AlertTitle>
        <AlertDescription>
          SYNC_TENANT_ID is not set, so events cannot be recorded or received.
        </AlertDescription>
      </Alert>
    );
  }
  if (!health.hub.reachable) {
    return (
      <Alert variant="destructive">
        <CloudSlashIcon />
        <AlertTitle>The hub cannot be reached</AlertTitle>
        <AlertDescription>
          The site keeps working. Events wait here and are sent when the
          connection returns.
          {health.hub.error ? ` (${health.hub.error})` : ""}
        </AlertDescription>
      </Alert>
    );
  }
  return null;
}

export function SyncOverview() {
  const { data, isLoading, isError, error } = syncQueries.useHealth();

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        {DIRECTIONS.map(({ direction }) => (
          <Skeleton key={direction} className="h-40 w-full" />
        ))}
      </div>
    );
  }
  if (isError || !data) {
    return (
      <Alert variant="destructive">
        <WarningCircleIcon />
        <AlertTitle>Could not load the sync status</AlertTitle>
        <AlertDescription>{errorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  const health = data.data;
  const stateOf = (direction: SyncDirection) =>
    health.state.find((state) => state.direction === direction);
  const outboxCounts = Object.entries(health.outbox).map(([status, total]) => ({
    status,
    total,
  }));

  return (
    <div className="flex flex-col gap-4">
      <Banner health={health} />

      <div className="grid gap-4 lg:grid-cols-3">
        {DIRECTIONS.map((item) => (
          <DirectionCard
            key={item.direction}
            {...item}
            state={stateOf(item.direction)}
            disabled={!health.enabled}
          />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CountCard
          title="Outbox"
          description="Events recorded at this site."
          counts={outboxCounts}
        />
        <CountCard
          title="Sent, at the hub"
          description="Waiting for the other site to confirm."
          counts={deliveriesOf(health.hub.deliveries, "outbound")}
        />
        <CountCard
          title="Incoming, at the hub"
          description="Addressed to this site."
          counts={deliveriesOf(health.hub.deliveries, "inbound")}
        />
        <Card>
          <CardHeader>
            <CardTitle>Applied here</CardTitle>
            <CardDescription>
              Events this site has taken in, and any that disagreed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-1 text-sm">
              <Row
                label="Events applied"
                value={formatSeparator(health.inboxReceipts)}
              />
              <Row
                label="Open conflicts"
                value={formatSeparator(health.openConflicts)}
              />
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Batches still arriving</CardTitle>
          <CardDescription>
            A batch can be used once all of its vouchers are here. If one stays
            incomplete, ask the issuing site to send it again from its batch
            list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {health.receivingBatches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Every received batch is complete.
            </p>
          ) : (
            <ul className="grid gap-4">
              {health.receivingBatches.map((batch) => (
                <li key={batch.id}>
                  <Progress
                    value={batch.receivedCount}
                    max={Math.max(batch.expectedCount, 1)}
                  >
                    <ProgressLabel>
                      <Link
                        href={`${BATCHES_PATH}/${batch.id}`}
                        className="font-mono underline-offset-4 hover:underline"
                      >
                        {batch.batchCode}
                      </Link>
                    </ProgressLabel>
                    <ProgressValue>
                      {() =>
                        `${formatSeparator(batch.receivedCount)} of ${formatSeparator(batch.expectedCount)}`
                      }
                    </ProgressValue>
                  </Progress>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
