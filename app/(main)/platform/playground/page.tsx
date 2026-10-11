import { PageHeader } from "@/components/general/page-header";
import { VoucherCheck } from "@/components/platform/playground/voucher-check/voucher-check";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";

export default function PlaygroundPage() {
  return (
    <main className={PAGE_ANIMATE_IN}>
      <PageHeader
        title="Playground"
        description="Check a voucher barcode. Nothing is redeemed."
      />
      <VoucherCheck />
    </main>
  );
}
