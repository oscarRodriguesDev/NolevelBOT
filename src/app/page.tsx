"use client";

import Link from "next/link";
import { ThemeToggle } from "./components/theme-toggle";
import Image from "next/image";
import dash from "../../public/landing/dash.png";
import {
  FiInbox,
  FiCpu,
  FiClock,
  FiArchive,
  FiBarChart2,
  FiLink,
} from "react-icons/fi";

export default function LandingPage() {
  const items = [
    {
      icon: FiInbox,
      label: "Centralização de chamados",
      description:
        "Todos os chamados reunidos em um único lugar, com organização por status, setor e prioridade.",
    },
    {
      icon: FiCpu,
      label: "Automação inteligente",
      description:
        "Abertura e direcionamento automático via WhatsApp, reduzindo atendimento manual e erros de triagem.",
    },
    {
      icon: FiClock,
      label: "Controle de SLA",
      description:
        "Definição de prazos por tipo de chamado com acompanhamento em tempo real de atrasos e cumprimento.",
    },
    {
      icon: FiArchive,
      label: "Histórico completo",
      description:
        "Registro detalhado de cada chamado com interações, mudanças de status e responsáveis.",
    },
    {
      icon: FiBarChart2,
      label: "Relatórios em tempo real",
      description:
        "Indicadores atualizados da operação para análise de desempenho e tomada de decisão.",
    },
    {
      icon: FiLink,
      label: "Integração via API",
      description:
        "Conexão com outros sistemas da empresa para automatizar fluxos e sincronizar dados.",
    },
  ];

  return (
<>
</>
  );
}