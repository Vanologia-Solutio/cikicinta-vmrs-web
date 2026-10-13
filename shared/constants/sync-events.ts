/**
 * The events a route can carry. Mirrors `SyncEventType` in the API, which is
 * also what the hub accepts; the three must change together.
 */
export const SYNC_EVENT_TYPE_OPTIONS = [
  { value: "voucher.batch.created", label: "Voucher batch created" },
  { value: "voucher.created", label: "Vouchers created" },
  { value: "voucher.batch.updated", label: "Voucher batch updated" },
  { value: "voucher.batch.deleted", label: "Voucher batch deleted" },
  { value: "voucher.redeemed", label: "Voucher redeemed" },
  { value: "master.category.upserted", label: "Category changed" },
  { value: "master.benefit.upserted", label: "Benefit changed" },
];

const LABELS: Record<string, string> = Object.fromEntries(
  SYNC_EVENT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
);

/** Readable name of an event type; an unknown one is shown as it is. */
export const syncEventLabel = (eventType: string) =>
  LABELS[eventType] ?? eventType;
