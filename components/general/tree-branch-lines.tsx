import { cn } from "@/lib/utils";

interface TreeBranchLinesProps {
  /**
   * One entry per ancestor level, outermost first: true when that ancestor
   * still has siblings below it, so its vertical line must continue past
   * this row.
   */
  ancestorLines: boolean[];
  /** Whether this node is the last child of its parent. */
  isLast: boolean;
  /** Width of one indent level. Narrower suits cramped columns. */
  gutterClassName?: string;
}

/**
 * The connector lines down the left of a tree row: a vertical rule per
 * ancestor level that still has siblings, then this node's own elbow.
 *
 * Render it only for depth > 0 - a root node has no connectors.
 */
export function TreeBranchLines({
  ancestorLines,
  isLast,
  gutterClassName = "w-8",
}: TreeBranchLinesProps) {
  return (
    <div className="flex shrink-0 self-stretch">
      {ancestorLines.map((hasLine, i) => (
        <span key={i} className={cn("relative shrink-0", gutterClassName)}>
          {hasLine && (
            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
          )}
        </span>
      ))}
      <span className={cn("relative shrink-0", gutterClassName)}>
        <span className="absolute top-0 left-1/2 h-1/2 w-px -translate-x-1/2 bg-border" />
        {!isLast && (
          <span className="absolute bottom-0 left-1/2 h-1/2 w-px -translate-x-1/2 bg-border" />
        )}
        <span className="absolute top-1/2 left-1/2 h-px w-1/2 -translate-y-1/2 bg-border" />
      </span>
    </div>
  );
}
