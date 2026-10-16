import {
  PrinterAgentError,
  printerAgentService,
} from "@/services/printer-agent-service";
import {
  getPrinterAgentToken,
  subscribePrinterAgentToken,
} from "@/shared/helpers/printer-agent-token";
import {
  AgentVoucher,
  CreateAgentPrintJobDto,
} from "@/shared/types/printer-agent";
import { isJobActive } from "@/shared/utils/printer-agent";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

const PRINTER_AGENT_QUERY_KEYS = {
  all: ["printer-agent"] as const,
  health: () => [...PRINTER_AGENT_QUERY_KEYS.all, "health"] as const,
  printers: () => [...PRINTER_AGENT_QUERY_KEYS.all, "printers"] as const,
  printerStatus: (printerId: string) =>
    [...PRINTER_AGENT_QUERY_KEYS.all, "printer-status", printerId] as const,
  jobs: () => [...PRINTER_AGENT_QUERY_KEYS.all, "jobs"] as const,
  labelSettings: () =>
    [...PRINTER_AGENT_QUERY_KEYS.all, "label-settings"] as const,
  preview: (codes: string[]) =>
    [...PRINTER_AGENT_QUERY_KEYS.all, "preview", ...codes] as const,
} as const;

// An unreachable or unpaired agent will not fix itself within a retry burst.
const retry = (failureCount: number, error: Error) =>
  !(error instanceof PrinterAgentError) && failureCount < 2;

export const usePrinterAgentToken = () =>
  useSyncExternalStore(
    subscribePrinterAgentToken,
    getPrinterAgentToken,
    () => null,
  );

// The agent is only contacted when a screen asks for it, and re-read on a
// timer only while a job is running. Nothing refetches on window focus.
const ON_DEMAND = { retry, refetchOnWindowFocus: false } as const;

export const printerAgentQueries = {
  keys: PRINTER_AGENT_QUERY_KEYS,

  useHealth: () =>
    useQuery({
      queryKey: PRINTER_AGENT_QUERY_KEYS.health(),
      queryFn: () => printerAgentService.getHealth(),
      ...ON_DEMAND,
    }),

  usePrinters: (enabled: boolean) =>
    useQuery({
      queryKey: PRINTER_AGENT_QUERY_KEYS.printers(),
      queryFn: () => printerAgentService.getPrinters(),
      enabled,
      ...ON_DEMAND,
    }),

  usePrinterStatus: (printerId: string | undefined, enabled: boolean) =>
    useQuery({
      queryKey: PRINTER_AGENT_QUERY_KEYS.printerStatus(printerId ?? ""),
      queryFn: () => printerAgentService.getPrinterStatus(printerId!),
      enabled: enabled && !!printerId,
      ...ON_DEMAND,
    }),

  useJobs: (enabled: boolean) =>
    useQuery({
      queryKey: PRINTER_AGENT_QUERY_KEYS.jobs(),
      queryFn: () => printerAgentService.getPrintJobs(),
      enabled,
      // Polled only while a job is still moving; idle costs nothing.
      refetchInterval: (query) =>
        query.state.data?.some(isJobActive) ? 1500 : false,
      ...ON_DEMAND,
    }),

  usePreview: (vouchers: AgentVoucher[], enabled: boolean) =>
    useQuery({
      queryKey: PRINTER_AGENT_QUERY_KEYS.preview(vouchers.map((v) => v.code)),
      queryFn: () => printerAgentService.previewLayout(vouchers),
      enabled: enabled && vouchers.length > 0,
      ...ON_DEMAND,
    }),

  useLabelSettings: (enabled: boolean) =>
    useQuery({
      queryKey: PRINTER_AGENT_QUERY_KEYS.labelSettings(),
      queryFn: () => printerAgentService.getLabelSettings(),
      enabled,
      ...ON_DEMAND,
    }),

  // Calibrating lifts a lock left by a stop, so the status is re-read.
  useCalibratePrinter: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (printerId: string) =>
        printerAgentService.calibratePrinter(printerId),
      onSettled: (_data, _error, printerId) =>
        queryClient.invalidateQueries({
          queryKey: PRINTER_AGENT_QUERY_KEYS.printerStatus(printerId),
        }),
    });
  },

  useConfirmCalibration: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (printerId: string) =>
        printerAgentService.confirmCalibration(printerId),
      onSettled: (_data, _error, printerId) =>
        queryClient.invalidateQueries({
          queryKey: PRINTER_AGENT_QUERY_KEYS.printerStatus(printerId),
        }),
    });
  },

  useStopPrinter: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (input: { printerId: string; jobId?: string }) =>
        printerAgentService.stopPrinter(input.printerId, input.jobId),
      // Jobs, printer status and the Windows queue count all change.
      onSettled: () =>
        queryClient.invalidateQueries({
          queryKey: PRINTER_AGENT_QUERY_KEYS.all,
        }),
    });
  },

  useTestPrint: () =>
    useMutation({
      mutationFn: (input: { printerId: string; rows: number }) =>
        printerAgentService.testPrint(input.printerId, input.rows),
    }),

  useCreateJob: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: CreateAgentPrintJobDto) =>
        printerAgentService.createPrintJob(payload),
      onSettled: () =>
        queryClient.invalidateQueries({
          queryKey: PRINTER_AGENT_QUERY_KEYS.jobs(),
        }),
    });
  },

  useRetryJob: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (input: {
        jobId: string;
        acknowledgeDuplicateRisk: boolean;
      }) =>
        printerAgentService.retryPrintJob(
          input.jobId,
          input.acknowledgeDuplicateRisk,
        ),
      onSettled: () =>
        queryClient.invalidateQueries({
          queryKey: PRINTER_AGENT_QUERY_KEYS.jobs(),
        }),
    });
  },
};
