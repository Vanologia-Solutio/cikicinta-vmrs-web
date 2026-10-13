"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { syncQueries } from "@/hooks/use-sync";
import { errorMessage, notify } from "@/lib/toast";
import { syncEventLabel } from "@/shared/constants/sync-events";
import { SyncConflict } from "@/shared/types/sync";
import { formatTag } from "@/shared/utils/formatter";
import { CheckIcon, EyeIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { useState } from "react";

/** The event exactly as it arrived, for whoever has to reconcile it. */
function ViewConflictDialog({ entity }: { entity: SyncConflict }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="View conflict details"
            title="View details"
          />
        }
      >
        <EyeIcon />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{formatTag(entity.reason)}</DialogTitle>
          <DialogDescription>
            {syncEventLabel(entity.eventType)}
          </DialogDescription>
        </DialogHeader>
        {entity.details && <p className="text-sm">{entity.details}</p>}
        <pre className="max-h-80 overflow-auto rounded-md bg-muted p-3 text-xs">
          {JSON.stringify(entity.payload, null, 2)}
        </pre>
        {entity.resolutionNote && (
          <p className="text-sm text-muted-foreground">
            Resolution note: {entity.resolutionNote}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Closes a conflict once it has been dealt with. Nothing is changed in the
 * voucher data; the record stays, marked resolved.
 */
function ResolveConflictDialog({ entity }: { entity: SyncConflict }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const { mutateAsync: resolve, isPending } = syncQueries.useResolveConflict();

  if (entity.status !== "open") return null;

  const handleResolve = async () => {
    try {
      const res = await resolve({
        id: entity.id,
        note: note.trim() || undefined,
      });
      notify.success(res.message ?? "Conflict resolved");
      setOpen(false);
    } catch (error) {
      notify.error("Failed to resolve the conflict", {
        description: errorMessage(error),
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return;
        if (!next) setNote("");
        setOpen(next);
      }}
    >
      <DialogTrigger
        render={
          <Button
            size="icon-sm"
            aria-label="Mark conflict as resolved"
            title="Mark as resolved"
          />
        }
      >
        <CheckIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as resolved</DialogTitle>
          <DialogDescription>
            This only closes the conflict. It does not change any voucher or
            redemption, so do that first if something needs correcting.
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="conflict-note">Note (optional)</FieldLabel>
          <Textarea
            id="conflict-note"
            placeholder="What was done about it"
            value={note}
            disabled={isPending}
            onChange={(event) => setNote(event.target.value)}
          />
        </Field>
        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline" disabled={isPending} />
            }
          >
            Cancel
          </DialogClose>
          <Button disabled={isPending} onClick={handleResolve}>
            {isPending ? (
              <SpinnerGapIcon className="animate-spin" />
            ) : (
              <CheckIcon />
            )}
            Mark as resolved
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const SYNC_CONFLICT_TABLE_ACTIONS = {
  view: ViewConflictDialog,
  resolve: ResolveConflictDialog,
};
