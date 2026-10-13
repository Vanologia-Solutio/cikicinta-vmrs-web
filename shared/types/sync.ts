export type SyncDirection = "publish" | "pull" | "cleanup";
export type SyncOutboxStatus =
  "pending" | "processing" | "published" | "failed";
export type SyncConflictStatus = "open" | "resolved";

/** How one direction of sync last went. Timestamps are ISO strings. */
export interface SyncDirectionState {
  direction: SyncDirection;
  status: "unknown" | "ok" | "failing";
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  consecutiveFailures: number;
  lastEventId: string | null;
  lastRunCount: number;
}

/** Deliveries at the hub, counted by direction and status. */
export interface SyncHubDelivery {
  direction: "inbound" | "outbound";
  /** pending, acknowledged, failed or expired. */
  status: string;
  total: number;
  oldest: string | null;
}

/** A batch that has arrived here but is still missing vouchers. */
export interface SyncReceivingBatch {
  id: string;
  batchCode: string;
  expectedCount: number;
  receivedCount: number;
  createdAt: string;
}

export interface SyncHealth {
  enabled: boolean;
  /** The tenant this deployment is; null when it is not configured. */
  tenantId: string | null;
  redemptionEnabled: boolean;
  state: SyncDirectionState[];
  outbox: Record<SyncOutboxStatus, number>;
  inboxReceipts: number;
  openConflicts: number;
  receivingBatches: SyncReceivingBatch[];
  hub: {
    reachable: boolean;
    error: string | null;
    deliveries: SyncHubDelivery[] | null;
  };
}

export interface SyncOutboxEvent {
  id: string;
  sequence: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  idempotencyKey: string;
  status: SyncOutboxStatus;
  attemptCount: number;
  availableAt: string;
  publishedAt: string | null;
  lastError: string | null;
  createdAt: string;
}

export interface SyncConflict {
  id: string;
  eventId: string;
  sourceTenantId: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  reason: string;
  details: string | null;
  payload: Record<string, unknown>;
  status: SyncConflictStatus;
  resolvedBy: string | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
}

/** Counters returned by a manual run; the keys depend on the direction. */
export type SyncRunResult = Record<string, number>;
