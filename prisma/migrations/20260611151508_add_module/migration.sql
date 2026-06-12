-- CreateEnum
CREATE TYPE "modulo" AS ENUM ('OFICINA', 'CORPORATIVO', 'EVENTOS');

-- AlterTable
ALTER TABLE "empresa" ADD COLUMN     "modulos" "modulo"[];
