"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { HOME_ROUTE } from "@/shared/constants/common";
import { findMenuNodeByPath } from "@/shared/helpers/menu";
import { useAuthStore } from "@/shared/stores/auth-store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

function segmentToLabel(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .replace(/\bAnd\b/g, "&");
}

export function HeaderBreadcrumbs() {
  const pathname = usePathname();
  const accessibleMenus = useAuthStore((s) => s.accessibleMenus);
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0 || pathname === HOME_ROUTE) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:inline-flex">
          <BreadcrumbLink render={<Link href={HOME_ROUTE} />}>
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, i) => {
          const href = "/" + segments.slice(0, i + 1).join("/");
          const isLast = i === segments.length - 1;
          const label =
            findMenuNodeByPath(accessibleMenus ?? {}, href)?.title ??
            segmentToLabel(segment);
          return (
            <Fragment key={href}>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem
                className={isLast ? undefined : "hidden md:inline-flex"}
              >
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={href} />}>
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
