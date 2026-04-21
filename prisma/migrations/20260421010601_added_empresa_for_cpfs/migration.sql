/*
  Warnings:

  - Added the required column `empresaId` to the `cpfs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cpfs" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "cpfs" ADD CONSTRAINT "cpfs_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
