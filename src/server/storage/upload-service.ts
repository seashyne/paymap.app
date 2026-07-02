import { uploadToR2, type UploadCategory } from "@/lib/r2"

export async function uploadBufferToR2(params: {
  userId: string
  category: UploadCategory
  filename: string
  contentType: string
  body: Buffer
  metadata?: Record<string, string>
}) {
  return uploadToR2(params.body, {
    userId: params.userId,
    category: params.category,
    filename: params.filename,
    contentType: params.contentType,
    metadata: params.metadata,
  })
}
