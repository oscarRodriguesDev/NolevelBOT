/* import { createClient } from "@supabase/supabase-js"

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
  defaultUrl = '',
  upsert = false,
}: UploadOptions): Promise<string | null> {
  if (!file) return defaultUrl

  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert,
      })

    if (error) return defaultUrl

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return data?.publicUrl || defaultUrl
  } catch {
    return defaultUrl
  }
} */


  import { createClient } from "@supabase/supabase-js"

// Cria o client do Supabase usando as variáveis de ambiente.
// Esse client aponta para o storage do projeto (banco master, no seu caso).
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,        // URL do projeto Supabase
  process.env.SUPABASE_SERVICE_ROLE_KEY!        // Chave com acesso total (server-side)
)

// Tipagem das opções aceitas pela função de upload
type UploadOptions = {
  tenantSlug: string        // Identificador da empresa (usado para isolar os arquivos)
  file?: File | null        // Arquivo a ser enviado
  folder?: string           // Subpasta dentro do tenant (ex: "avatars", "tickets")
  fileName?: string         // Nome customizado do arquivo (opcional)
  defaultUrl?: string       // URL fallback caso algo falhe
  upsert?: boolean          // Define se pode sobrescrever arquivo existente
}

// Define um bucket fixo para evitar que o caller escolha arbitrariamente
const BUCKET = "Uploads"

// Função principal de upload
export async function uploadFile({
  tenantSlug,
  file,
  folder = "",
  fileName,
  defaultUrl = "",
  upsert = false,
}: UploadOptions): Promise<string | null> {

  // Se não houver arquivo, retorna a URL padrão
  if (!file) return defaultUrl

  try {
    // Extrai a extensão do arquivo original (ex: png, jpg, pdf)
    const fileExt = file.name.split(".").pop()

    // Define o nome final do arquivo:
    // - Se o usuário informou um nome, usa ele + extensão
    // - Caso contrário, gera um UUID para evitar colisão
    const finalFileName =
      fileName
        ? `${fileName}.${fileExt}`
        : `${crypto.randomUUID()}.${fileExt}`

    // Define o "namespace" base do tenant
    // Ex: empresa-a
    const basePath = `${tenantSlug}`

    // Se existir folder, adiciona dentro do tenant
    // Ex: empresa-a/avatars
    const fullFolder =
      folder
        ? `${basePath}/${folder}`
        : basePath

    // Monta o caminho final do arquivo no storage
    // Ex: empresa-a/avatars/uuid.png
    const filePath = `${fullFolder}/${finalFileName}`

    // Executa o upload no bucket fixo
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600", // cache de 1 hora
        upsert,               // permite sobrescrever se true
      })

    // Se houver erro no upload, retorna fallback
    if (error) return defaultUrl

    // Recupera a URL pública do arquivo enviado
    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath)

    // Retorna a URL pública ou fallback
    return data?.publicUrl || defaultUrl

  } catch {
    // Em caso de erro inesperado, retorna fallback
    return defaultUrl
  }
}