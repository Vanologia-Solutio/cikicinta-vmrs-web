import { DeleteVoucherBatchDialog } from "./delete-voucher-batch-dialog";
import { EditVoucherBatchDialog } from "./edit-voucher-batch-dialog";
import { RegenerateVoucherBatchButton } from "./regenerate-voucher-batch-button";

export const VOUCHER_BATCH_TABLE_ACTIONS = {
  regenerate: RegenerateVoucherBatchButton,
  edit: EditVoucherBatchDialog,
  delete: DeleteVoucherBatchDialog,
};
