import { CategoriesAndBenefitsTabs } from "@/components/voucher-management/categories-and-benefits/categories-and-benefits-tabs";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";

export default function CategoriesAndBenefitsPage() {
  return (
    <main className={PAGE_ANIMATE_IN}>
      <CategoriesAndBenefitsTabs />
    </main>
  );
}
