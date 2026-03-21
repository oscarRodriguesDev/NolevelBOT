import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { ROLE } from "@prisma/client"

export const runtime = "nodejs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  throw new Error("Supabase env vars não definidas")
}

const supabase = createClient(supabaseUrl, serviceKey)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const cpf = formData.get("cpf") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as string
    const setor = formData.get("setor") as string
    const file = formData.get("avatar") as File | null

    let avatarUrl: string | null =
      "https://seu-dominio.com/default-avatar.png"

    if (file) {
      try {
        const fileExt = file.name.split(".").pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const filePath = `/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from("profile")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          })

        if (!uploadError) {
          const { data } = supabase.storage
            .from("profile")
            .getPublicUrl(filePath)

          if (data?.publicUrl) {
            avatarUrl = data.publicUrl
          }
        }
      } catch (e) {
        // ignora erro de upload
      }
    }

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        cpf,
        password: hashedPassword,
        role: role as ROLE,
        setor,
        avatarUrl,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    )
  }
}


