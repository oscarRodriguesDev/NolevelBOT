-- AlterTable
ALTER TABLE "avisos" ADD COLUMN     "duracao" TEXT;

-- CreateTable
CREATE TABLE "CompanyConfig" (
    "id" TEXT NOT NULL,
    "databaseUrl" TEXT NOT NULL,
    "aiProvider" TEXT NOT NULL DEFAULT 'gpt',
    "aiModel" TEXT,
    "aiApiKey" TEXT,
    "companyName" TEXT,
    "companyLogo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyConfig_pkey" PRIMARY KEY ("id")
);
