import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const createdBuckets = new Set<string>()

async function ensureBucket(bucket: string) {
  if (createdBuckets.has(bucket)) return
  try {
    const { error } = await supabase.storage.createBucket(bucket, { public: true })
    if (error && !error.message?.toLowerCase().includes("already exists") && !error.message?.toLowerCase().includes("duplicate")) {
      console.warn(`Erro ao criar bucket "${bucket}":`, error.message)
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message.toLowerCase() : ""
    if (!msg.includes("already exists") && !msg.includes("duplicate")) {
      console.warn(`Erro ao criar bucket "${bucket}":`, err)
    }
  }
  createdBuckets.add(bucket)
}

type UploadOptions = {
  bucket: string
  folder?: string
  file?: File | null
  defaultUrl?: string
  upsert?: boolean
}

export async function uploadFile({
  bucket,
  folder = "",
  file,
  defaultUrl = "",
  upsert = false,
}: UploadOptions): Promise<string | null> {
  if (!file) return defaultUrl

  await ensureBucket(bucket)

  const fileExt = file.name.split(".").pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`
  const filePath = folder ? `${folder}/${fileName}` : fileName

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType: file.type || undefined,
      cacheControl: "3600",
      upsert,
    })

  if (error) {
    console.error("UPLOAD ERROR:", error)
    return defaultUrl
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function uploadBuffer({
  buffer,
  fileName,
  mimeType,
  bucket = "anexo",
  folder = "",
}: {
  buffer: Buffer
  fileName: string
  mimeType: string
  bucket?: string
  folder?: string
}): Promise<string | null> {
  await ensureBucket(bucket)

  const filePath = folder ? `${folder}/${fileName}` : fileName

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType: mimeType,
      cacheControl: "3600",
      upsert: false,
    })

  if (error) {
    console.error("UPLOAD BUFFER ERROR:", error)
    return null
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}