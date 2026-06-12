import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/upload";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "profile";
    const folder = (formData.get("folder") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
    }

    const url = await uploadFile({
      bucket,
      folder,
      file,
      defaultUrl: "",
    });

    if (!url) {
      return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
