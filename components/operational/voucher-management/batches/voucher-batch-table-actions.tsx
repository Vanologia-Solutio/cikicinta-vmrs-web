import { DeleteVoucherBatchDialog } from "./delete-voucher-batch-dialog";
import { EditVoucherBatchDialog } from "./edit-voucher-batch-dialog";
import { RegenerateVoucherBatchButton } from "./regenerate-voucher-batch-button";
import { RepublishVoucherBatchButton } from "./republish-voucher-batch-button";

export const VOUCHER_BATCH_TABLE_ACTIONS = {
  regenerate: RegenerateVoucherBatchButton,
  republish: RepublishVoucherBatchButton,
  edit: EditVoucherBatchDialog,
  delete: DeleteVoucherBatchDialog,
};
