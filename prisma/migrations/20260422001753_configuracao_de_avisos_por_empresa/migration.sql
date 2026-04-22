/*
  Warnings:

  - Added the required column `empresaId` to the `avisos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "avisos" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "avisos" ADD CONSTRAINT "avisos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
