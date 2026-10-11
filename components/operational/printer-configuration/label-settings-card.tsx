"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  printerAgentQueries,
  usePrinterAgentToken,
} from "@/hooks/use-printer-agent";
import { AgentLabelSettings } from "@/shared/types/printer-agent";

const SENSOR_LABELS: Record<AgentLabelSettings["sensor"], string> = {
  gap: "Gap between rows",
  bline: "Black mark",
  continuous: "Continuous (no sensor)",
};

const mm = (value: number) => `${value} mm`;
const onOff = (value?: boolean) =>
  value === undefined ? "Printer default" : value ? "On" : "Off";

function rows(settings: AgentLabelSettings): [string, string][] {
  return [
    ["Resolution", `${settings.dpi} dpi`],
    ["Sticker size", `${settings.labelWidthMm} × ${settings.labelHeightMm} mm`],
    ["Stickers per row", String(settings.columns)],
    ["Gap between stickers", mm(settings.columnGapMm)],
    ["Row width", mm(settings.rowWidthMm)],
    ["Gap between rows", mm(settings.rowGapMm)],
    ["Row sensing", SENSOR_LABELS[settings.sensor]],
    ["Offset", `X ${settings.offsetXMm} mm, Y ${settings.offsetYMm} mm`],
    ["Bar width", `${settings.moduleDots} dots`],
    ["Bar height", mm(settings.barHeightMm)],
    ["Text font", settings.textFont],
    ["Print density", settings.density?.toString() ?? "Printer default"],
    ["Print speed", settings.speed?.toString() ?? "Printer default"],
    ["Print direction", String(settings.direction)],
    ["Peel-off", onOff(settings.peel)],
    ["Tear-off", onOff(settings.tear)],
    [
      "Voucher code",
      `${settings.codeLength} ${settings.codeCharset} characters`,
    ],
    ["Stickers per job", `up to ${settings.maxLabelsPerJob}`],
  ];
}

export function LabelSettingsCard() {
  const token = usePrinterAgentToken();
  const { data, isPending, isError } =
    printerAgentQueries.useLabelSettings(!!token);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Label settings</CardTitle>
        <CardDescription>
          What the agent was started with. To change them, edit the agent&apos;s
          .env file and restart the agent, then calibrate again.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!token ? (
          <p className="text-muted-foreground">
            Pair with the printer agent to see its settings.
          </p>
        ) : isPending ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : isError || !data ? (
          <p className="text-muted-foreground">
            The settings could not be read from the agent.
          </p>
        ) : (
          <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {rows(data).map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-4 border-b py-1"
              >
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
