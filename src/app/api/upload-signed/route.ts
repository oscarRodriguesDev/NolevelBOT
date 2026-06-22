import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALLOWED_BUCKETS = ["anexo", "logo"]
const ALLOWED_FOLDERS = ["", "chatbot", "empresas"]
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"]
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"]
const MAX_FILE_SIZE = 10 * 1024 * 1024

export const runtime = 'nodejs'

const bucketCache = new Set<string>()

async function ensureBucket(bucket: string) {
  if (bucketCache.has(bucket)) return
  const { data } = await supabase.storage.getBucket(bucket)
  if (!data) {
    await supabase.storage.createBucket(bucket, { public: true })
  }
  bucketCache.add(bucket)
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const rate = await checkRateLimit(`upload-signed:${ip}`, 10, 60 * 1000)
    if (!rate.allowed) {
      return NextResponse.json({ error: "Muitas requisições. Aguarde." }, { status: 429 })
    }

    const { fileName, fileType, fileSize, bucket, folder } = await req.json()

    if (!fileName) {
      return NextResponse.json({ error: "fileName é obrigatório" }, { status: 400 })
    }

    const ext = (fileName.split(".").pop() || "").toLowerCase()
    const resolvedBucket = bucket || "anexo"
    const resolvedFolder = folder || ""

    if (!ALLOWED_BUCKETS.includes(resolvedBucket)) {
      return NextResponse.json({ error: "Bucket inválido" }, { status: 400 })
    }
    if (!ALLOWED_FOLDERS.includes(resolvedFolder)) {
      return NextResponse.json({ error: "Pasta inválida" }, { status: 400 })
    }
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: "Tipo de arquivo não permitido. Apenas JPG, PNG e PDF." }, { status: 400 })
    }
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      return NextResponse.json({ error: "Tipo MIME não permitido. Apenas image/jpeg, image/png e application/pdf." }, { status: 400 })
    }
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE / 1024 / 1024}MB.` }, { status: 400 })
    }

    await ensureBucket(resolvedBucket)

    const uniqueName = `${crypto.randomUUID()}.${ext}`
    const filePath = resolvedFolder ? `${resolvedFolder}/${uniqueName}` : uniqueName

    const { data, error } = await supabase.storage
      .from(resolvedBucket)
      .createSignedUploadUrl(filePath)

    if (error || !data) {
      console.error("createSignedUploadUrl error:", error)
      return NextResponse.json({ error: "Erro ao gerar URL de upload" }, { status: 500 })
    }

    const { data: pubData } = supabase.storage
      .from(resolvedBucket)
      .getPublicUrl(filePath)

    return NextResponse.json({
      signedUrl: data.signedUrl,
      publicUrl: pubData.publicUrl,
      filePath,
    })
  } catch (err) {
    console.error("upload-signed error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
