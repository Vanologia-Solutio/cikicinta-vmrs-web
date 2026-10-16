"use client";

import { PageHeader } from "@/components/general/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fragment, useState } from "react";
import { CreateVoucherBenefitDialog } from "./benefits/create-voucher-benefit-dialog";
import { VoucherBenefitsTable } from "./benefits/voucher-benefits-table";
import { CreateVoucherCategoryDialog } from "./categories/create-voucher-category-dialog";
import { VoucherCategoriesTable } from "./categories/voucher-categories-table";

type TabValue = "categories" | "benefits";

export function CategoriesAndBenefitsTabs() {
  const [tab, setTab] = useState<TabValue>("categories");

  return (
    <Fragment>
      <PageHeader
        title="Categories & Benefits"
        description="Manage voucher categories and the benefits under them."
        actions={
          tab === "categories" ? (
            <CreateVoucherCategoryDialog />
          ) : (
            <CreateVoucherBenefitDialog />
          )
        }
      />
      <Tabs value={tab} onValueChange={(value) => setTab(value as TabValue)}>
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <VoucherCategoriesTable />
        </TabsContent>
        <TabsContent value="benefits">
          <VoucherBenefitsTable />
        </TabsContent>
      </Tabs>
    </Fragment>
  );
}
