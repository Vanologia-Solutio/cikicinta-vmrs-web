import * as z from "zod";
import { User } from "../types/user";

export const userSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional(),
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
  tenantId: z.string().min(1, { message: "Tenant is required" }),
  roleId: z.string().min(1, { message: "Role is required" }),
  isActive: z.boolean().optional(),
});

export type UserFormValues = z.infer<typeof userSchema>;

export const defaultRegisterUserValues: UserFormValues = {
  firstName: "",
  lastName: "",
  username: "",
  password: "",
  tenantId: "",
  roleId: "",
  isActive: true,
};

export const editUserSchema = userSchema.omit({ password: true });

export type EditUserFormValues = z.infer<typeof editUserSchema>;

export const defaultUpdateUserValues = (user: User): EditUserFormValues => ({
  firstName: user.firstName,
  lastName: user.lastName ?? "",
  username: user.username,
  tenantId: user.tenant.id,
  roleId: user.role.id,
  isActive: user.isActive,
});
