import { useAuthStore } from "@/shared/stores/auth-store";

/**
 * Schedules set the pace of the sync workers on every site, so only the
 * primary tenant may change them. The API enforces the same rule.
 */
export function useCanManageSyncSchedules(): boolean {
  return useAuthStore((state) => !!state.user?.attrs.tenant.isPrimary);
}
