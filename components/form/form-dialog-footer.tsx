import { PaperPlaneRightIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { DialogClose, DialogFooter } from "../ui/dialog";

export function FormDialogFooter({
  formId,
  isLoading,
}: {
  formId: string;
  isLoading: boolean;
}) {
  return (
    <DialogFooter>
      <DialogClose
        render={<Button variant="outline" disabled={isLoading} type="button" />}
      >
        Cancel
      </DialogClose>
      <Button type="submit" form={formId} disabled={isLoading}>
        {isLoading ? (
          <SpinnerGapIcon className="animate-spin" />
        ) : (
          <PaperPlaneRightIcon />
        )}
        Submit
      </Button>
    </DialogFooter>
  );
}
