/*
  Warnings:

  - You are about to drop the column `telefone` on the `cpfs` table. All the data in the column will be lost.
  - You are about to drop the `cache` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tickets_evitados` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "cpfs" DROP COLUMN "telefone";

-- DropTable
DROP TABLE "cache";

-- DropTable
DROP TABLE "tickets_evitados";
