-- CreateEnum
CREATE TYPE "plano" AS ENUM ('START', 'PROFISSIONAL', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "empresa" ADD COLUMN     "plano" "plano" NOT NULL DEFAULT 'START';
