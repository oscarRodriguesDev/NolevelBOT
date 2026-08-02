-- CreateTable: planos dinâmicos do SaaS
CREATE TABLE "planos" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "maxModulos" INTEGER NOT NULL DEFAULT -1,
    "maxUsuarios" INTEGER NOT NULL DEFAULT 5,
    "botIA" BOOLEAN NOT NULL DEFAULT false,
    "canais" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "modulosAutomaticos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "extincaoEm" TIMESTAMP(3),
    "extincaoAvisadaEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "planos_slug_key" ON "planos"("slug");
CREATE INDEX "planos_ativo_ordem_idx" ON "planos"("ativo", "ordem");

-- Seed dos 3 planos iniciais (fonte: src/lib/planos.ts, valores provisórios)
INSERT INTO "planos" ("id", "slug", "nome", "preco", "descricao", "maxModulos", "maxUsuarios", "botIA", "canais", "modulosAutomaticos", "ativo", "destaque", "ordem", "updatedAt") VALUES
  ('10000000-0000-0000-0000-000000000001', 'start', 'Start', 299.99, 'Para empresas que querem automatizar o atendimento sem complicação.', 1, 5, false, ARRAY['app'], ARRAY[]::TEXT[], true, false, 1, CURRENT_TIMESTAMP),
  ('10000000-0000-0000-0000-000000000002', 'profissional', 'Profissional', 699.99, 'A escolha certa para empresas que usam a plataforma no dia a dia.', 2, 15, true, ARRAY['app','whatsapp'], ARRAY[]::TEXT[], true, true, 2, CURRENT_TIMESTAMP),
  ('10000000-0000-0000-0000-000000000003', 'enterprise', 'Enterprise', 989.90, 'Para empresas que precisam de atendimento multicanal completo.', -1, 30, true, ARRAY['app','whatsapp','telegram'], ARRAY['CORPORATIVO','OFICINA','COMERCIAL'], true, false, 3, CURRENT_TIMESTAMP);

-- AlterTable: empresa.plano de enum para text (slug) — preservando valores
ALTER TABLE "empresa" ALTER COLUMN "plano" TYPE TEXT USING "plano"::text;
UPDATE "empresa" SET "plano" = lower("plano");
ALTER TABLE "empresa" ALTER COLUMN "plano" SET DEFAULT 'start';

-- DropEnum
DROP TYPE "plano";
