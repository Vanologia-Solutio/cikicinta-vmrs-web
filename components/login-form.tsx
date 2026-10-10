"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";
import { Fragment, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { GoToMainDialog } from "@/components/auth/go-to-main-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
  defaultLoginValues,
  LoginFormValues,
  loginSchema,
} from "@/shared/schemas/auth";
import { useAuthStore } from "@/shared/stores/auth-store";
import { SignInIcon, SpinnerGapIcon } from "@phosphor-icons/react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { isLoading, isAuthenticated, signIn } = useAuthStore();
  const [justLoggedIn, setJustLoggedIn] = useState<boolean>(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLoginValues,
  });

  const handleLogin = async (values: LoginFormValues) => {
    const login = async () => {
      const res = await signIn(values);
      if (!res.success) throw new Error(res.message);

      setJustLoggedIn(true);
      // Full reload so AuthInitializer re-runs and loads /auth/me with the new tokens
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/callback";
      return res;
    };

    await toast
      .promise(login(), {
        loading: "Logging in...",
        success: (res) => res.message || "Login successful",
        error: (error) => (error as Error)?.message || "Something went wrong",
      })
      .catch(() => {});
  };

  const isDisabled = isLoading || isAuthenticated;
  const showDialog = !justLoggedIn && isAuthenticated;

  return (
    <Fragment>
      <GoToMainDialog open={showDialog} />
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={form.handleSubmit(handleLogin)}
        noValidate
        {...props}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Login to your account</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Enter your credentials below to login to your account
            </p>
          </div>
          <Controller
            control={form.control}
            name="username"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  {...field}
                  id="username"
                  type="text"
                  placeholder="john.doe"
                  autoComplete="username"
                  aria-invalid={fieldState.invalid}
                  disabled={isDisabled}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  {...field}
                  id="password"
                  type="password"
                  placeholder="********"
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                  disabled={isDisabled}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Field>
            <Button type="submit" disabled={isDisabled}>
              {isLoading ? (
                <SpinnerGapIcon className="animate-spin" />
              ) : (
                <SignInIcon />
              )}
              Login
            </Button>
          </Field>
          <FieldSeparator />
          <FieldDescription className="text-center">
            Don&apos;t have an account? Contact your administrator.
          </FieldDescription>
        </FieldGroup>
      </form>
    </Fragment>
  );
}
