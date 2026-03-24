-- CreateTable
CREATE TABLE "empresa" (
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "setores" TEXT[]
);

-- CreateIndex
CREATE UNIQUE INDEX "empresa_nome_key" ON "empresa"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "empresa_cnpj_key" ON "empresa"("cnpj");
