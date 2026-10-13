import { useAuthStore } from "@/shared/stores/auth-store";

/**
 * Routes decide which tenant's data reaches which other tenant, so only the
 * primary tenant's users may change them. The API enforces this; hiding the
 * controls just avoids offering something that would be refused.
 */
export function useCanManageSyncRoutes(): boolean {
  return useAuthStore((state) => !!state.user?.attrs.tenant.isPrimary);
}
