import { Badge } from "@/components/ui/badge";
import { CheckIcon, XIcon } from "@phosphor-icons/react";

/** Yes/No badge for boolean table cells (Active, Default, Visible, ...). */
export function BooleanBadge({
  value,
  trueLabel = "Yes",
  falseLabel = "No",
}: {
  value: boolean;
  trueLabel?: string;
  falseLabel?: string;
}) {
  return (
    <Badge variant={value ? "default" : "outline"}>
      {value ? <CheckIcon /> : <XIcon />}
      {value ? trueLabel : falseLabel}
    </Badge>
  );
}
