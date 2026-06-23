import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .url("URL tidak valid")
  .optional()
  .or(z.literal(""));

export const threadSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  body: z.string().trim().min(1, "Isi wajib diisi"),
  lessonId: z.string().optional(),
});

export const replySchema = z.object({
  body: z.string().trim().min(1, "Balasan tidak boleh kosong"),
});

export const faqSchema = z.object({
  question: z.string().trim().min(1, "Pertanyaan wajib diisi"),
  answer: z.string().trim().min(1, "Jawaban wajib diisi"),
});

export const announcementSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi"),
  body: z.string().trim().min(1, "Isi wajib diisi"),
});

export const liveSessionSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi"),
  scheduledAt: z.coerce.date({ message: "Tanggal tidak valid" }),
  meetUrl: optionalUrl,
  description: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi"),
  avatarUrl: optionalUrl,
});

export const lessonSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi"),
  description: z.string().optional(),
  moduleId: z.string().min(1, "Modul wajib dipilih"),
  videoId: z.string().optional().nullable(),
  videoDuration: z.coerce.number().int().nonnegative().optional().nullable(),
  isFree: z.boolean().optional(),
});

export const subscriptionPriceSchema = z.coerce
  .number()
  .int()
  .nonnegative("Harga harus angka positif");

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Warna harus hex seperti #14B8A6");
