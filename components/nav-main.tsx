"use client";

import { DynamicIcon } from "@/components/general/icon";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { isMenuItemActive, isMenuItemCurrent } from "@/shared/helpers/menu";
import { MenuItem } from "@/shared/types/menu";
import { CaretRightIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function NavMain({
  label,
  items,
}: {
  label: string;
  items: MenuItem[];
}) {
  const pathname = usePathname();
  const visibleItems = items.filter((item) => item.isVisible);

  if (!visibleItems.length) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {visibleItems.map((item) => {
          const children = item.items?.filter((child) => child.isVisible) ?? [];

          if (!children.length) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isMenuItemCurrent(item, pathname)}
                  render={<Link href={item.url ?? "#"} />}
                >
                  <DynamicIcon name={item.icon} />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <NavCollapsibleItem
              key={item.title}
              item={item}
              items={children}
              pathname={pathname}
            />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavCollapsibleItem({
  item,
  items,
  pathname,
}: {
  item: MenuItem;
  items: MenuItem[];
  pathname: string;
}) {
  const isActive = isMenuItemActive(item, pathname);
  const [open, setOpen] = useState(isActive);

  const [wasActive, setWasActive] = useState(isActive);
  if (isActive !== wasActive) {
    setWasActive(isActive);
    if (isActive) setOpen(true);
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger render={<SidebarMenuButton tooltip={item.title} />}>
        <DynamicIcon name={item.icon} />
        <span>{item.title}</span>
        <CaretRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {items.map((subItem) => (
            <SidebarMenuSubItem key={subItem.title}>
              <SidebarMenuSubButton
                isActive={isMenuItemActive(subItem, pathname)}
                render={<Link href={subItem.url ?? "#"} />}
              >
                <span>{subItem.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
