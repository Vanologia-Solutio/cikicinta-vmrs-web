import { HOME_ROUTE } from "../constants/common";
import { MenuGroups, MenuItem } from "../types/menu";

function collectPaths(items: MenuItem[], paths: string[]) {
  items.forEach((item) => {
    if (item.url && item.url !== "#") paths.push(item.url);
    if (item.items?.length) collectPaths(item.items, paths);
  });
}

export function extractAllowedPaths(menus: MenuGroups): string[] {
  const paths: string[] = [];

  Object.values(menus || {}).forEach((group: MenuItem[]) => {
    collectPaths(group, paths);
  });

  return paths;
}

export function hasMenuAccess(pathname: string, allowedPaths: string[]) {
  if (pathname === "/" || pathname === HOME_ROUTE) return true;
  return allowedPaths.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(path + "/") ||
      path.startsWith(pathname + "/"),
  );
}

export function findMenuNodeByUrl(
  items: MenuItem[],
  url: string,
): MenuItem | null {
  for (const item of items) {
    if (item.url === url) return item;
    if (item.items?.length) {
      const found = findMenuNodeByUrl(item.items, url);
      if (found) return found;
    }
  }
  return null;
}

export function findMenuNodeInGroups(
  menus: MenuGroups,
  url: string,
): MenuItem | null {
  for (const items of Object.values(menus || {})) {
    const found = findMenuNodeByUrl(items, url);
    if (found) return found;
  }
  return null;
}

/** True when the item itself, or any descendant, is the current route. */
export function isMenuItemActive(item: MenuItem, pathname: string): boolean {
  if (item.url && item.url !== "#") {
    if (pathname === item.url || pathname.startsWith(item.url + "/"))
      return true;
  }
  return !!item.items?.some((child) => isMenuItemActive(child, pathname));
}

/** True when this exact item is the best (deepest) match for the route. */
export function isMenuItemCurrent(item: MenuItem, pathname: string): boolean {
  if (!item.url || item.url === "#") return false;
  const matches = pathname === item.url || pathname.startsWith(item.url + "/");
  if (!matches) return false;
  return !item.items?.some((child) => isMenuItemActive(child, pathname));
}

// "Access Management" -> "access-management", "Sales & Marketing" -> "sales-and-marketing"
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Resolves a pathname to a menu node. Tries an exact url match first, then
 * walks the path by slug: the first segment is the group (module) name and
 * each following segment a child title. The slug walk is what finds parent
 * menus stored with a "#" url, e.g. /platform/access-management.
 *
 * A path that names only the group returns a synthetic node holding the
 * group's root items.
 */
export function findMenuNodeByPath(
  menus: MenuGroups,
  pathname: string,
): MenuItem | null {
  const exact = findMenuNodeInGroups(menus, pathname);
  if (exact) return exact;

  const [groupSegment, ...rest] = pathname.split("/").filter(Boolean);
  if (!groupSegment) return null;

  const groupKey = Object.keys(menus || {}).find(
    (key) => slugify(key) === groupSegment,
  );
  if (!groupKey) return null;

  let node: MenuItem = {
    title: groupKey,
    isVisible: true,
    items: menus[groupKey],
  };
  for (const segment of rest) {
    const child = node.items?.find((item) => slugify(item.title) === segment);
    if (!child) return null;
    node = child;
  }
  return node;
}

/** Link target for a menu item: its url, or a slug under `basePath` for "#" parents. */
export function menuItemHref(item: MenuItem, basePath: string): string {
  if (item.url && item.url !== "#") return item.url;
  return `${basePath.replace(/\/$/, "")}/${slugify(item.title)}`;
}
