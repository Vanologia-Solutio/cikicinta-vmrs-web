"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { SyncConflictsTable } from "./sync-conflicts-table";
import { SyncOutboxTable } from "./sync-outbox-table";
import { SyncOverview } from "./sync-overview";

type TabValue = "overview" | "outbox" | "conflicts";

export function SyncMonitorTabs() {
  const [tab, setTab] = useState<TabValue>("overview");

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as TabValue)}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="outbox">Outbox</TabsTrigger>
        <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <SyncOverview />
      </TabsContent>
      <TabsContent value="outbox">
        <SyncOutboxTable />
      </TabsContent>
      <TabsContent value="conflicts">
        <SyncConflictsTable />
      </TabsContent>
    </Tabs>
  );
}
