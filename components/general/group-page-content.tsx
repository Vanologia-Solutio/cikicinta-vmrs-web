"use client";

import { DynamicIcon } from "@/components/general/icon";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";
import { findMenuNodeByPath, menuItemHref } from "@/shared/helpers/menu";
import { useAuthStore } from "@/shared/stores/auth-store";
import { CaretRightIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageHeader } from "./page-header";

interface GroupPageContentProps {
  title?: string;
  description?: string;
}

/**
 * Landing page for a menu group (e.g. /platform, /platform/access-management):
 * the child menus the current user can access, as link cards.
 */
export function GroupPageContent({
  title,
  description,
}: GroupPageContentProps) {
  const pathname = usePathname();
  const accessibleMenus = useAuthStore((s) => s.accessibleMenus);
  const match = findMenuNodeByPath(accessibleMenus ?? {}, pathname);
  const items = (match?.items ?? []).filter((item) => item.isVisible);

  const displayTitle = title ?? match?.title ?? "Section";
  const displayDescription =
    description ?? "Choose a section below to get started.";

  return (
    <main className={PAGE_ANIMATE_IN}>
      <PageHeader title={displayTitle} description={displayDescription} />
      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link key={item.title} href={menuItemHref(item, pathname)}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <DynamicIcon name={item.icon} className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription className="truncate">
                      Access {item.title}
                    </CardDescription>
                  </div>
                  <CaretRightIcon className="size-4 shrink-0 text-muted-foreground" />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No sections available.</p>
      )}
    </main>
  );
}
