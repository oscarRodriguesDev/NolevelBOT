import { NextRequest, NextResponse } from "next/server"
import { uploadFile } from "@/lib/upload"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

const ALLOWED_BUCKETS = ["anexo", "logo"]
const ALLOWED_FOLDERS = ["", "chatbot", "empresas"]
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"]
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"]
const MAX_FILE_SIZE = 10 * 1024 * 1024

//export const runtime = 'edge';
export const runtime = 'nodejs';
// Faz upload de arquivo validando tipo, tamanho e bucket permitido
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const rate = await checkRateLimit(`upload:${ip}`, 10, 60 * 1000)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Muitas requisições. Aguarde antes de enviar outro arquivo." },
        { status: 429 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const bucket = (formData.get("bucket") as string) || "anexo"
    const folder = (formData.get("folder") as string) || ""

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 })
    }

    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: "Bucket inválido" }, { status: 400 })
    }

    if (!ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json({ error: "Pasta inválida" }, { status: 400 })
    }

    const extension = (file.name.split(".").pop() || "").toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Apenas JPG, PNG e PDF." },
        { status: 400 }
      )
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo MIME não permitido. Apenas image/jpeg, image/png e application/pdf." },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE / 1024 / 1024}MB.` },
        { status: 413 }
      )
    }

    const url = await uploadFile({
      bucket,
      folder,
      file,
      defaultUrl: "",
    })

    if (!url) {
      return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 })
    }

    return NextResponse.json({ url })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
