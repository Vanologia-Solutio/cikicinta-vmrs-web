import { toast } from "@/components/ui/toast";

interface NotifyOptions {
  description?: string;
}

/**
 * sonner-shaped helpers over the Base UI toast manager, so feature code can
 * call `notify.success(message)` / `notify.error(title, { description })`.
 */
export const notify = {
  success: (title: string, options?: NotifyOptions) =>
    toast.add({ type: "success", title, ...options }),
  error: (title: string, options?: NotifyOptions) =>
    toast.add({ type: "error", title, ...options }),
  info: (title: string, options?: NotifyOptions) =>
    toast.add({ type: "info", title, ...options }),
  warning: (title: string, options?: NotifyOptions) =>
    toast.add({ type: "warning", title, ...options }),
};

/** Message from a rejected API call (http-client rejects with the response body). */
export function errorMessage(error: unknown): string {
  return (error as Error)?.message || "Something went wrong";
}
