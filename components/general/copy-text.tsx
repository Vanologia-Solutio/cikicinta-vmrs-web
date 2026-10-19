"use client";

import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

const COPIED_RESET_MS = 1500;

interface CopyTextProps {
  text: string;
  /** Makes the text a button; ignored when `href` is set. */
  onClick?: () => void;
  /** Makes the text a link. */
  href?: string;
  className?: string;
  /** Applied to the text itself, e.g. `font-mono` for codes. */
  textClassName?: string;
  iconClassName?: string;
}

/** Text with a button beside it that copies the text to the clipboard. */
export function CopyText({
  text,
  onClick,
  href,
  className,
  textClassName,
  iconClassName,
}: CopyTextProps) {
  const [isCopied, setIsCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    // Inside a clickable row or cell, copying must not also trigger it.
    event.stopPropagation();
    try {
      // navigator.clipboard is undefined outside a secure context (plain HTTP).
      await navigator.clipboard.writeText(text);
    } catch {
      notify.error("Could not copy to clipboard");
      return;
    }
    notify.success("Copied to clipboard");
    setIsCopied(true);
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setIsCopied(false), COPIED_RESET_MS);
  };

  const linkClassName = cn("h-auto p-0", textClassName);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {href ? (
        <Button
          variant="link"
          className={linkClassName}
          nativeButton={false}
          render={<Link href={href} />}
        >
          {text}
        </Button>
      ) : onClick ? (
        <Button variant="link" className={linkClassName} onClick={onClick}>
          {text}
        </Button>
      ) : (
        <span className={textClassName}>{text}</span>
      )}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleCopy}
        aria-label={isCopied ? "Copied" : `Copy ${text}`}
      >
        {isCopied ? (
          <CheckIcon
            className={cn("text-green-600 dark:text-green-400", iconClassName)}
          />
        ) : (
          <CopyIcon className={iconClassName} />
        )}
      </Button>
    </div>
  );
}
