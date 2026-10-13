import { Badge } from "@/components/ui/badge";
import { formatTag } from "@/shared/utils/formatter";

type Variant = "default" | "secondary" | "destructive" | "outline";

/** Done and healthy / still in progress / needs someone / nothing yet. */
const VARIANTS: Record<string, Variant> = {
  ok: "default",
  published: "default",
  acknowledged: "default",
  resolved: "default",
  pending: "secondary",
  processing: "secondary",
  open: "destructive",
  failed: "destructive",
  failing: "destructive",
  expired: "destructive",
  unknown: "outline",
};

/** One badge for every sync status, so the same word always looks the same. */
export function SyncStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={VARIANTS[status] ?? "outline"}>{formatTag(status)}</Badge>
  );
}
