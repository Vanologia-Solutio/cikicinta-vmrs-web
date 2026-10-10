"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth-service";
import {
  HOME_ROUTE,
  PAGE_ANIMATE_IN,
  PROJECT_NAME,
} from "@/shared/constants/common";
import {
  CompleteOnboardingFormValues,
  completeOnboardingSchema,
  defaultCompleteOnboardingValues,
} from "@/shared/schemas/auth";
import { useAuthStore } from "@/shared/stores/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircleIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";

export default function OnboardingPage() {
  const { user } = useAuthStore();

  const { mutateAsync: completeOnboarding, isPending: isCompletingOnboarding } =
    useMutation({ mutationFn: () => authService.completeOnboarding() });

  const form = useForm<CompleteOnboardingFormValues>({
    resolver: zodResolver(completeOnboardingSchema),
    defaultValues: defaultCompleteOnboardingValues,
  });

  const handleCompleteOnboarding = async () => {
    try {
      const res = await completeOnboarding();
      if (res.success) {
        toast.add({ type: "success", title: res.message });
        window.location.replace(HOME_ROUTE);
      }
    } catch (error) {
      toast.add({
        type: "error",
        title: "Failed to complete onboarding",
        description: (error as Error)?.message || "Something went wrong",
      });
    }
  };

  return (
    <main
      className={cn(
        PAGE_ANIMATE_IN,
        "flex h-screen items-center justify-center p-4",
      )}
    >
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="inline-flex items-center justify-between gap-2 text-lg">
            <p>
              Welcome to{" "}
              <strong className="text-primary">{PROJECT_NAME}</strong>
            </p>
            <Badge variant="secondary">Onboarding</Badge>
          </CardTitle>
          <CardDescription>
            You&apos;re about to access the system for{" "}
            <strong className="text-primary">{user?.attrs.tenant.name}</strong>{" "}
            as <strong className="text-primary">{user?.attrs.role.name}</strong>
            . Please confirm that you are authorized to use this system for{" "}
            {PROJECT_NAME} operations and that you will only access data
            necessary for your role.
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={form.handleSubmit(handleCompleteOnboarding)}
          className="space-y-4"
        >
          <CardContent>
            <FieldGroup className="gap-2.5">
              <Controller
                control={form.control}
                name="authorizedToUseSystem"
                render={({ field, fieldState }) => (
                  <Field
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}
                  >
                    <Checkbox
                      id="authorizedToUseSystem"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked)}
                      aria-invalid={fieldState.invalid}
                      disabled={isCompletingOnboarding}
                    />
                    <FieldLabel htmlFor="authorizedToUseSystem">
                      I confirm that I am authorized to use this system for the
                      platform operations.
                    </FieldLabel>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="authorizedToAccessData"
                render={({ field, fieldState }) => (
                  <Field
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}
                  >
                    <Checkbox
                      id="authorizedToAccessData"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked)}
                      aria-invalid={fieldState.invalid}
                      disabled={isCompletingOnboarding}
                    />
                    <FieldLabel htmlFor="authorizedToAccessData">
                      I confirm that I will only access data necessary for my
                      role.
                    </FieldLabel>
                  </Field>
                )}
              />
              <FieldError
                errors={[
                  form.formState.errors.authorizedToUseSystem,
                  form.formState.errors.authorizedToAccessData,
                ]}
              />
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              type="submit"
              disabled={isCompletingOnboarding}
            >
              {isCompletingOnboarding ? (
                <SpinnerGapIcon className="animate-spin" />
              ) : (
                <CheckCircleIcon />
              )}
              Confirm
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
