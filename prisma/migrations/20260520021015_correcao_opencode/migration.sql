/*
  Warnings:

  - You are about to drop the `CompanyConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CompanyConfig";

-- CreateIndex
CREATE INDEX "Chamado_empresaId_idx" ON "Chamado"("empresaId");

-- CreateIndex
CREATE INDEX "Chamado_cpf_idx" ON "Chamado"("cpf");

-- CreateIndex
CREATE INDEX "Chamado_status_idx" ON "Chamado"("status");

-- CreateIndex
CREATE INDEX "Chamado_empresaId_status_idx" ON "Chamado"("empresaId", "status");

-- CreateIndex
CREATE INDEX "Chamado_ticket_idx" ON "Chamado"("ticket");

-- CreateIndex
CREATE INDEX "User_empresaId_idx" ON "User"("empresaId");

-- CreateIndex
CREATE INDEX "User_cpf_idx" ON "User"("cpf");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "avisos_empresaId_idx" ON "avisos"("empresaId");

-- CreateIndex
CREATE INDEX "avisos_setor_idx" ON "avisos"("setor");

-- CreateIndex
CREATE INDEX "cpfs_empresaId_idx" ON "cpfs"("empresaId");

-- CreateIndex
CREATE INDEX "cpfs_cpf_idx" ON "cpfs"("cpf");

-- CreateIndex
CREATE INDEX "cpfsLeads_cpf_idx" ON "cpfsLeads"("cpf");

-- CreateIndex
CREATE INDEX "cpfsLeads_telefone_idx" ON "cpfsLeads"("telefone");

-- CreateIndex
CREATE INDEX "empresa_nome_idx" ON "empresa"("nome");

-- CreateIndex
CREATE INDEX "empresa_cnpj_idx" ON "empresa"("cnpj");

-- CreateIndex
CREATE INDEX "resumoPersona_cpf_idx" ON "resumoPersona"("cpf");

-- CreateIndex
CREATE INDEX "tickets_fechados_cpf_idx" ON "tickets_fechados"("cpf");

-- CreateIndex
CREATE INDEX "tickets_fechados_ticket_idx" ON "tickets_fechados"("ticket");
