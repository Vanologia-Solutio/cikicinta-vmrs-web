type HasName = {
  firstName?: string | null;
  lastName?: string | null;
};

export function fullName<T extends HasName>(user?: T | null): string {
  return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
}

export function initials<T extends HasName>(user?: T | null): string {
  const parts = fullName(user).split(/\s+/);
  return parts.length
    ? (parts[0]?.[0] || "") +
        (parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "")
    : "";
}
