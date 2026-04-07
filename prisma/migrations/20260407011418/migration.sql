/*
  Warnings:

  - You are about to drop the `Chamado` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompanyConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `avisos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cpfs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `resumoPersona` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tickets_fechados` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `empresa` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `empresa` table without a default value. This is not possible if the table is not empty.
  - Made the column `databaseUrl` on table `empresa` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Chamado" DROP CONSTRAINT "Chamado_atendenteId_fkey";

-- AlterTable
ALTER TABLE "empresa" ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "databaseUrl" SET NOT NULL;

-- DropTable
DROP TABLE "Chamado";

-- DropTable
DROP TABLE "CompanyConfig";

-- DropTable
DROP TABLE "avisos";

-- DropTable
DROP TABLE "cpfs";

-- DropTable
DROP TABLE "resumoPersona";

-- DropTable
DROP TABLE "tickets_fechados";

-- DropTable
DROP TABLE "user";

-- DropEnum
DROP TYPE "ROLE";

-- CreateIndex
CREATE UNIQUE INDEX "empresa_slug_key" ON "empresa"("slug");
