"use client";

import * as Icons from "@phosphor-icons/react";
import type { Icon, IconProps } from "@phosphor-icons/react";
import { createElement } from "react";

const ICONS = Icons as unknown as Record<string, Icon | undefined>;

/**
 * Every phosphor icon name without the "Icon" suffix (e.g. "House", "Users"),
 * for pickers. Menu icons are stored in the database in this form.
 */
export const ICON_NAMES: string[] = Object.keys(Icons)
  .filter((key) => /^[A-Z]\w*Icon$/.test(key))
  .map((key) => key.replace(/Icon$/, ""))
  .sort();

/** Resolves "House" or "HouseIcon" to its component; unknown names fall back to a folder. */
export function getIcon(name?: string | null): Icon {
  if (!name) return Icons.FolderIcon;
  const key = name.endsWith("Icon") ? name : `${name}Icon`;
  return ICONS[key] ?? Icons.FolderIcon;
}

export function DynamicIcon({
  name,
  className,
  ...props
}: IconProps & { name?: string | null }) {
  const lowered = name?.toLowerCase() ?? "";
  const isLoader = lowered.includes("spinner") || lowered.includes("loader");
  const mergedClassName = isLoader
    ? [className, "animate-spin"].filter(Boolean).join(" ")
    : className;

  return createElement(getIcon(name), { ...props, className: mergedClassName });
}
