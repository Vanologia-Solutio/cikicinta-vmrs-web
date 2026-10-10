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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  deleteEntitySchema,
  DeleteEntityValues,
} from "@/shared/schemas/general";
import { zodResolver } from "@hookform/resolvers/zod";
import { SpinnerGapIcon, TrashIcon } from "@phosphor-icons/react";
import { ReactElement, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface DeleteEntityDialogProps {
  title?: string;
  description?: string;
  entityName: string;
  onDelete: (values: DeleteEntityValues) => void;
  isDeleting?: boolean;
  /** Element rendered as the dialog trigger (defaults to a trash icon button). */
  trigger?: ReactElement;
}

export function DeleteEntityDialog({
  title,
  description,
  entityName,
  onDelete,
  isDeleting = false,
  trigger,
}: DeleteEntityDialogProps) {
  const [open, setOpen] = useState<boolean>(false);

  const schema = useMemo(() => deleteEntitySchema(entityName), [entityName]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { confirm: "" },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isDeleting) return;
        if (!next) form.reset();
        setOpen(next);
      }}
    >
      <DialogTrigger
        render={
          trigger ?? (
            <Button
              variant="destructive"
              size="icon-sm"
              aria-label={`Delete ${entityName}`}
            >
              <TrashIcon />
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ?? "Delete Entity"}</DialogTitle>
          <DialogDescription>
            {description ?? "This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onDelete)} className="space-y-4">
          <Controller
            control={form.control}
            name="confirm"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="confirm">
                  To confirm, type &quot;{entityName}&quot;
                </FieldLabel>
                <Input
                  id="confirm"
                  aria-invalid={fieldState.invalid}
                  placeholder={entityName}
                  disabled={isDeleting}
                  autoComplete="off"
                  {...field}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={isDeleting} />
              }
            >
              Cancel
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={isDeleting}>
              {isDeleting ? (
                <SpinnerGapIcon className="animate-spin" />
              ) : (
                <TrashIcon />
              )}
              Delete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
