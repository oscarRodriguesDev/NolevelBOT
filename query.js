const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const total = await p.chamado.count();
  console.log('Total chamados:', total);
  const chamados = await p.chamado.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: { ticket: true, cpf: true, setor: true, nome: true, createdAt: true }
  });
  console.log(JSON.stringify(chamados, null, 2));
}
main().catch(e => console.error(e)).finally(() => p.$disconnect());
