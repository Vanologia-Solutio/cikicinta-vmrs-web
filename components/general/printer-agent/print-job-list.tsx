import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AgentPrintJob } from "@/shared/types/printer-agent";
import {
  canRetryJob,
  JOB_STATUS_PRESENTATION,
} from "@/shared/utils/printer-agent";
import { ArrowClockwiseIcon } from "@phosphor-icons/react";
import { format } from "date-fns";

interface PrintJobListProps {
  jobs: AgentPrintJob[];
  onRetry: (job: AgentPrintJob) => void;
  /** Job currently being retried, to disable its button. */
  retryingJobId?: string;
}

export function PrintJobList({
  jobs,
  onRetry,
  retryingJobId,
}: PrintJobListProps) {
  if (jobs.length === 0) {
    return <p className="text-muted-foreground">No print jobs yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Stickers</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Details</TableHead>
          <TableHead className="w-20" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => {
          const status = JOB_STATUS_PRESENTATION[job.status];
          return (
            <TableRow key={job.id} data-job-status={job.status}>
              <TableCell className="text-muted-foreground">
                {format(new Date(job.createdAt), "HH:mm:ss")}
              </TableCell>
              <TableCell>
                {job.labelCount}
                {job.retryOf && (
                  <span className="text-muted-foreground"> (retry)</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={status.variant}>{status.label}</Badge>
              </TableCell>
              <TableCell className="max-w-md whitespace-normal">
                {job.error && <div className="font-medium">{job.error}</div>}
                <div className="text-muted-foreground">
                  {job.detail ?? status.description}
                </div>
              </TableCell>
              <TableCell>
                {canRetryJob(job) && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={retryingJobId === job.id}
                    onClick={() => onRetry(job)}
                  >
                    <ArrowClockwiseIcon />
                    Retry
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
