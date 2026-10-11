import { PageHeader } from "@/components/general/page-header";
import { CreateVoucherBatchDialog } from "@/components/operational/voucher-management/batches/create-voucher-batch-dialog";
import { VoucherBatchesTable } from "@/components/operational/voucher-management/batches/voucher-batches-table";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";

export default function VoucherBatchesPage() {
  return (
    <main className={PAGE_ANIMATE_IN}>
      <PageHeader
        title="Voucher Batches"
        description="Generate vouchers in batches and print their stickers."
        actions={<CreateVoucherBatchDialog />}
      />
      <VoucherBatchesTable />
    </main>
  );
}
