import { z } from "zod";

export const emailSchema = z.string().trim().email("Email tidak valid");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password wajib diisi"),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi"),
  email: emailSchema,
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const magicLinkSchema = z.object({
  email: emailSchema,
});

export const passwordChangeSchema = z
  .object({
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Password tidak cocok",
    path: ["confirm"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
