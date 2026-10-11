import { PageHeader } from "@/components/general/page-header";
import { StickerPrintPlayground } from "@/components/platform/playground/sticker-print/sticker-print-playground";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";

export default function PlaygroundPage() {
  return (
    <main className={PAGE_ANIMATE_IN}>
      <PageHeader
        title="Playground"
        description="Thermal sticker printing through the printer agent."
      />
      <StickerPrintPlayground />
    </main>
  );
}
