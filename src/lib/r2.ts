// v4.2.1: Cloudflare R2 Object Storage
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) return null

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })
}

const BUCKET = process.env.R2_BUCKET_NAME ?? process.env.R2_BUCKET ?? "paymap-uploads"
const PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "")

export type UploadCategory =
  | "receipts"
  | "invoices"
  | "avatars"
  | "documents"
  | "exports"
  | "storeLogos"
  | "storeBanners"
  | "productImages"
  | "payProfileImages"
  | "payProfileCovers"
  | "userBackgrounds"

const CATEGORY_PREFIX: Record<UploadCategory, string> = {
  receipts: "receipts",
  invoices: "invoices",
  avatars: "avatars",
  documents: "documents",
  exports: "exports",
  storeLogos: "store-logos",
  storeBanners: "store-banners",
  productImages: "product-images",
  payProfileImages: "pay-profile-images",
  payProfileCovers: "pay-profile-covers",
  userBackgrounds: "user-backgrounds",
}

export interface UploadResult {
  key: string
  url: string
  size: number
  contentType: string
}

export async function uploadToR2(
  buffer: Buffer,
  opts: {
    userId: string
    category: UploadCategory
    filename: string
    contentType: string
    metadata?: Record<string, string>
  }
): Promise<UploadResult> {
  const client = getR2Client()
  if (!client) throw new Error("R2_NOT_CONFIGURED: Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in .env.local")

  const safe = opts.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120)
  const key = `${CATEGORY_PREFIX[opts.category]}/${opts.userId}/${Date.now()}_${safe}`

  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: opts.contentType,
    ContentLength: buffer.length,
    Metadata: {
      userId: opts.userId,
      category: opts.category,
      originalName: opts.filename,
      uploadedAt: new Date().toISOString(),
      ...(opts.metadata ?? {}),
    },
  }))

  const url = PUBLIC_URL
    ? `${PUBLIC_URL}/${key}`
    : await getSignedUrl(client, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: 3600 * 24 * 7 })

  return { key, url, size: buffer.length, contentType: opts.contentType }
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client()
  if (!client) return
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

export async function getPresignedUploadUrl(key: string, contentType: string, expiresIn = 300): Promise<string> {
  const client = getR2Client()
  if (!client) throw new Error("R2_NOT_CONFIGURED")

  return getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn }
  )
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]

export const ALLOWED_TYPES: Record<UploadCategory, string[]> = {
  receipts: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  invoices: ["application/pdf", "image/jpeg", "image/png"],
  avatars: IMAGE_TYPES,
  documents: ["application/pdf", "image/jpeg", "image/png", "text/csv"],
  exports: ["text/csv", "application/json", "application/pdf"],
  storeLogos: IMAGE_TYPES,
  storeBanners: IMAGE_TYPES,
  productImages: IMAGE_TYPES,
  payProfileImages: IMAGE_TYPES,
  payProfileCovers: IMAGE_TYPES,
  userBackgrounds: IMAGE_TYPES,
}

export const MAX_FILE_SIZE: Record<UploadCategory, number> = {
  receipts: 5 * 1024 * 1024,
  invoices: 10 * 1024 * 1024,
  avatars: 2 * 1024 * 1024,
  documents: 20 * 1024 * 1024,
  exports: 50 * 1024 * 1024,
  storeLogos: 2 * 1024 * 1024,
  storeBanners: 5 * 1024 * 1024,
  productImages: 4 * 1024 * 1024,
  payProfileImages: 2 * 1024 * 1024,
  payProfileCovers: 5 * 1024 * 1024,
  userBackgrounds: 5 * 1024 * 1024,
}

export function validateUpload(file: { size: number; type: string }, category: UploadCategory): string | null {
  const allowed = ALLOWED_TYPES[category]
  if (!allowed.includes(file.type)) return `ประเภทไฟล์ไม่รองรับ รองรับ: ${allowed.join(", ")}`
  const maxSize = MAX_FILE_SIZE[category]
  if (file.size > maxSize) return `ไฟล์ใหญ่เกินไป (สูงสุด ${Math.round(maxSize / 1024 / 1024)} MB)`
  return null
}

export function isR2Configured(): boolean {
  return !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY)
}
