-- CreateEnum
CREATE TYPE "statusPagamento" AS ENUM ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO', 'REEMBOLSADO');

-- AlterTable
ALTER TABLE "empresa" ADD COLUMN     "statusPagamento" "statusPagamento" NOT NULL DEFAULT 'PENDENTE',
ADD COLUMN     "asaasCustomerId" TEXT,
ADD COLUMN     "asaasSubscriptionId" TEXT,
ADD COLUMN     "asaasPaymentId" TEXT,
ADD COLUMN     "trialAtivo" BOOLEAN NOT NULL DEFAULT true;
