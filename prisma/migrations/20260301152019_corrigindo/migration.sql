/*
  Warnings:

  - You are about to drop the column `atendendente` on the `Chamado` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chamado" DROP COLUMN "atendendente",
ADD COLUMN     "atendente" TEXT;
