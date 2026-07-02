import { z } from "zod"

const modeSchema = z.enum(["personal", "business", "merchant"])
const internalPathSchema = z.string().optional().nullable()

export const loginSchema = z.object({
  email: z.string().trim().min(1, "กรุณากรอก Email").email("รูปแบบ Email ไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอก Password").min(8, "Password ต้องมีอย่างน้อย 8 ตัวอักษร"),
  mode: modeSchema.optional(),
  next: internalPathSchema,
})

export const registerSchema = z.object({
  name: z.string().trim().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร").max(100, "ชื่อยาวเกินไป"),
  email: z.string().trim().min(1, "กรุณากรอก Email").email("รูปแบบ Email ไม่ถูกต้อง"),
  password: z.string().min(8, "Password ต้องมีอย่างน้อย 8 ตัวอักษร").regex(/[A-Z]/, "ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว").regex(/[0-9]/, "ต้องมีตัวเลขอย่างน้อย 1 ตัว"),
  confirmPassword: z.string().optional(),
  mode: modeSchema.optional(),
  next: internalPathSchema,
}).superRefine((data, ctx) => {
  if (typeof data.confirmPassword === "string" && data.confirmPassword !== data.password) {
    ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Password ไม่ตรงกัน" })
  }
})

export const firebaseSessionSchema = z.object({
  idToken: z.string().min(1, "Missing Firebase ID token"),
  mode: modeSchema.optional(),
  next: internalPathSchema,
  name: z.string().optional(),
  image: z.string().optional().nullable(),
})

export const switchWorkspaceSchema = z.object({
  mode: modeSchema,
  redirect: z.string().optional(),
})
