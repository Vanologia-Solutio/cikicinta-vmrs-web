import { VoucherBatchDetails } from "@/components/voucher-management/batches/details/voucher-batch-details";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";

export default async function VoucherBatchDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className={PAGE_ANIMATE_IN}>
      <VoucherBatchDetails id={id} />
    </main>
  );
}
