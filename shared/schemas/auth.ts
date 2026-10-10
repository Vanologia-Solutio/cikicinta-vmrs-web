import { z } from "zod";
import { PROJECT_NAME } from "../constants/common";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const defaultLoginValues: LoginFormValues = {
  username: "",
  password: "",
};

export const completeOnboardingSchema = z.object({
  authorizedToUseSystem: z.boolean().refine((value) => value, {
    message: `You must confirm that you are authorized to use this system for ${PROJECT_NAME} operations.`,
  }),
  authorizedToAccessData: z.boolean().refine((value) => value, {
    message:
      "You must confirm that you will only access data necessary for your role.",
  }),
});

export type CompleteOnboardingFormValues = z.infer<
  typeof completeOnboardingSchema
>;

export const defaultCompleteOnboardingValues: CompleteOnboardingFormValues = {
  authorizedToUseSystem: false,
  authorizedToAccessData: false,
};
