import type { Metadata } from "next";
import "./globals.css";
import RootLayoutClient from "./layout-client";




export const metadata: Metadata = {
  title: "NolevelBOT - Sistema de Chamados",
  description: "Sistema inteligente de gestão de chamados e atendimento",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`ransition-colors duration-300`}>
        <>
        <RootLayoutClient>
<>

              {children}
</>

          </RootLayoutClient>
        </>
      </body>
    </html>
  );
}