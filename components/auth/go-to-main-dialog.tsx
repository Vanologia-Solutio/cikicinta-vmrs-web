"use client";

import { HOME_ROUTE } from "@/shared/constants/common";
import { ShieldCheckIcon } from "@phosphor-icons/react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "../ui/alert-dialog";

export function GoToMainDialog({ open = false }: { open?: boolean }) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <ShieldCheckIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>You are already logged in</AlertDialogTitle>
          <AlertDialogDescription>
            You are already authenticated. Continue to the dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            nativeButton={false}
            render={<Link href={HOME_ROUTE} replace />}
          >
            Go to Dashboard
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
