import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"]
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"]
const MAX_FILE_SIZE = 10 * 1024 * 1024

export const ALLOWED_EXTENSIONS_LIST = ALLOWED_EXTENSIONS
export const ALLOWED_MIME_TYPES_LIST = ALLOWED_MIME_TYPES
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE

export function getExtension(filename: string): string {
  return (filename.split(".").pop() || "").toLowerCase()
}

export function validarArquivo({
  extension,
  mimeType,
  size,
}: {
  extension: string
  mimeType: string
  size: number
}): string | null {
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return "Tipo de arquivo não permitido. Apenas JPG, PNG e PDF."
  }
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return "Tipo MIME não permitido. Apenas image/jpeg, image/png e application/pdf."
  }
  if (size > MAX_FILE_SIZE) {
    return `Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE / 1024 / 1024}MB.`
  }
  return null
}

const createdBuckets = new Set<string>()

async function ensureBucket(bucket: string) {
  if (createdBuckets.has(bucket)) return

  try {
    const { data: existing } = await supabase.storage.getBucket(bucket)
    if (existing) {
      createdBuckets.add(bucket)
      return
    }
  } catch { }

  try {
    const { error } = await supabase.storage.createBucket(bucket, { public: true })
    if (error) {
      if (!error.message?.toLowerCase().includes("already exists") &&
          !error.message?.toLowerCase().includes("duplicate") &&
          !error.message?.toLowerCase().includes("row-level security")) {
        console.warn(`Erro ao criar bucket "${bucket}":`, error.message)
      }
    }
  } catch { }

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

  const extension = getExtension(file.name)
  const erro = validarArquivo({
    extension,
    mimeType: file.type,
    size: file.size,
  })
  if (erro) {
    console.error("UPLOAD VALIDATION ERROR:", erro)
    return null
  }

  await ensureBucket(bucket)

  const fileName = `${crypto.randomUUID()}.${extension}`
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
  const extension = getExtension(fileName)
  const erro = validarArquivo({
    extension,
    mimeType,
    size: buffer.length,
  })
  if (erro) {
    console.error("UPLOAD BUFFER VALIDATION ERROR:", erro)
    return null
  }

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