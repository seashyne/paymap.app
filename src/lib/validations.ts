import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "กรุณากรอก Email")
    .email("รูปแบบ Email ไม่ถูกต้อง"),
  password: z
    .string()
    .min(1, "กรุณากรอก Password")
    .min(8, "Password ต้องมีอย่างน้อย 8 ตัวอักษร"),
  remember: z.boolean().optional().default(false),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "กรุณากรอกชื่อ")
      .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
      .max(50, "ชื่อยาวเกินไป"),
    email: z
      .string()
      .min(1, "กรุณากรอก Email")
      .email("รูปแบบ Email ไม่ถูกต้อง"),
    password: z
      .string()
      .min(8, "Password ต้องมีอย่างน้อย 8 ตัวอักษร")
      .regex(/[A-Z]/, "ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว")
      .regex(/[0-9]/, "ต้องมีตัวเลขอย่างน้อย 1 ตัว"),
    confirmPassword: z.string().min(1, "กรุณายืนยัน Password"),
  })
  .refine((d: { password: string; confirmPassword: string }) => d.password === d.confirmPassword, {
    message: "Password ไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export const forgotSchema = z.object({
  email: z
    .string()
    .min(1, "กรุณากรอก Email")
    .email("รูปแบบ Email ไม่ถูกต้อง"),
});

export type LoginInput    = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotInput   = z.infer<typeof forgotSchema>;
