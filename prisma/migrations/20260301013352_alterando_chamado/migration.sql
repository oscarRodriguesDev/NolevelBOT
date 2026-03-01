/*
  Warnings:

  - Added the required column `cpf` to the `Chamado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `Chamado` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chamado" ADD COLUMN     "cpf" TEXT NOT NULL,
ADD COLUMN     "nome" TEXT NOT NULL;
