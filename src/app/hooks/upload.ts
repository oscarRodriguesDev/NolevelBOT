import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

  const fileExt = file.name.split(".").pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`
  const filePath = folder ? `${folder}/${fileName}` : fileName

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert,
    })

  if (error) {
    console.error("UPLOAD ERROR:", error)
    throw error
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}