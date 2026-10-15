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
import {
  ArrowRightIcon,
  CompassIcon,
  ShieldCheckIcon,
  SpinnerGapIcon,
  WavesIcon,
} from "@phosphor-icons/react";
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
        "mx-auto grid min-h-screen w-full max-w-6xl items-center justify-items-center gap-4 p-4 md:grid-cols-2 md:gap-8 lg:gap-16 lg:p-12",
      )}
    >
      <section className="space-y-4 hidden md:block">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
          {PROJECT_NAME}
        </p>
        <h1 className="text-primary text-3xl leading-tight font-semibold tracking-tight sm:text-5xl">
          Get started.
          <br />
          Work confidently.
        </h1>
        <p className="text-muted-foreground max-w-md">
          A few quick confirmations keep every operation secure, compliant, and
          tailored to your role.
        </p>
        <p className="text-primary inline-flex items-center gap-1.5 text-sm font-medium">
          <CompassIcon className="size-5" />
          Your workspace is almost ready
        </p>
      </section>

      <Card className="w-full max-w-xl shadow-lg lg:justify-self-end">
        <CardHeader className="space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full shadow-md">
              <WavesIcon className="size-6" />
            </div>
            <Badge variant="secondary">Onboarding</Badge>
          </div>
          <CardTitle className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">
              Welcome to {PROJECT_NAME}
            </p>
            <p className="text-primary text-2xl sm:text-3xl font-semibold tracking-tight">
              Make yourself at home.
            </p>
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
          <CardFooter className="flex-col gap-4">
            <Button
              className="w-full"
              size="lg"
              type="submit"
              disabled={isCompletingOnboarding}
            >
              Get started
              {isCompletingOnboarding ? (
                <SpinnerGapIcon className="animate-spin" />
              ) : (
                <ArrowRightIcon />
              )}
            </Button>
            <p className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
              <ShieldCheckIcon className="size-4" />
              Your access is logged and protected.
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
