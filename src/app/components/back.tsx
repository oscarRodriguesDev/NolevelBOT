"use client";

import { useRouter } from "next/navigation";
import { TiArrowBack } from "react-icons/ti";
import { motion } from "framer-motion";

export function BtnVoltar() {
  const router = useRouter();

  return (
    <motion.button
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      onClick={() => router.back()}
      className="absolute left-6 top-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--foreground)] text-sm font-bold shadow-sm transition-all hover:bg-[var(--surface-elevated)] hover:border-[var(--primary)] hover:text-[var(--primary)] group"
    >
      <TiArrowBack 
        size={20} 
        className="transition-transform group-hover:-translate-x-1" 
      />
      <span>Voltar</span>
    </motion.button>
  );
}