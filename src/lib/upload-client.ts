// Faz upload de arquivo via URL assinada e retorna a URL publica
export async function uploadFileDirect(
  file: File,
  bucket = "anexo",
  folder = ""
): Promise<string | null> {
  try {
    const res = await fetch("/api/upload-signed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        bucket,
        folder,
      }),
    })

    if (!res.ok) return null

    const { signedUrl, publicUrl } = await res.json()

    const uploadRes = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    })

    if (!uploadRes.ok) return null

    return publicUrl
  } catch {
    return null
  }
}
