import { voucherCheckService } from "@/services/voucher-check-service";
import { useMutation } from "@tanstack/react-query";

export const voucherCheckQueries = {
  // A mutation, not a query: each scan is one explicit request and must show
  // the voucher as it is right now, never a cached answer.
  useCheck: () =>
    useMutation({
      mutationFn: (code: string) => voucherCheckService.check(code),
    }),
};
