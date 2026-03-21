/*
  Warnings:

  - You are about to drop the column `atendente` on the `Chamado` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('GOD', 'ADMIN', 'GESTOR', 'ATENDENTE');

-- AlterTable
ALTER TABLE "Chamado" DROP COLUMN "atendente",
ADD COLUMN     "atendenteId" TEXT;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "ROLE" NOT NULL,
    "avatarUrl" TEXT,
    "setor" TEXT NOT NULL,
    "resumo" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- AddForeignKey
ALTER TABLE "Chamado" ADD CONSTRAINT "Chamado_atendenteId_fkey" FOREIGN KEY ("atendenteId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
