-- AlterTable
ALTER TABLE "empresa" ADD COLUMN     "api_key" TEXT,
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'EVOLUTION';
