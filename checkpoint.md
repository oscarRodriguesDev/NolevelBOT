# CHECKPOINT — NolevelBOT

## Sessao: 12/06/2026

### Branch Atual
`vibecode` (sincronizada com `origin/vibecode`)

### Ultimo Commit (HEAD)
```
da5f8eb revert: remove toda refatoracao dos dashboards (volta ao estado 2f0e380 antes de qualquer melhoria)
```

### Mudancas desta sessao (12/06/2026)

| Arquivo | Alteracao |
|---------|-----------|
| `src/app/api/dashboards/route.ts` | API reescrita: filtra por empresaId, query `modulo`, +6 metricas, deteccao oficina via parse JSON descricao |
| `src/app/corporativo/(atendimento)/dashboards/page.tsx` | Dashboard com KPIs, pizza status, barras prioridade, setor, evolucao, top motivos |
| `src/app/oficina/(atendimento)/dashboards/page.tsx` | Dashboard com KPIs, pizza status, funcoes, veiculos, defeitos, evolucao, ranking |
| `src/app/eventos/(atendimento)/dashboards/page.tsx` | Dashboard com KPIs, pizza status, leads, setor, evolucao, top motivos, ultimos leads |
| `memorias.md` | Registro de autoria das mudancas |

### Estado do Projeto

- **API `/api/dashboards`** agora filtra por empresa e aceita `?modulo=corporativo|oficina`
- **Corporativo:** mostra tickets com descricao texto livre (nao-JSON)
- **Oficina:** mostra tickets com descricao JSON (contendo funcao, numeroOnibus, defeito)
- **Eventos:** mostra tickets nao-oficina + leads de `/api/leads-network`
- **Build:** compilado com sucesso

### Tarefas Pendentes (de tasks.txt)

1. ~~setar data e hora automatico pelo whats~~ ✅ Feito
2. ~~mudar as nomeclaturas necessarias no formulario e opcoes para oficina~~ ✅ Feito
3. ⬜ opcao de foto no modulo de oficina (parcial: webhook-oficina ja coleta foto opcional)
4. ⬜ funcionalidade de entregar os avisos para os motoristas
5. ~~melhorar dashboards para visualizacao de oficina~~ ✅ Feito
6. ~~onde estiver apontando como motorista coloca colaborador~~ ✅ Feito
7. ~~quando logado como atendente deve redirecionar para os chamados~~ ✅ Feito
8. ~~mostrar nome da empresa em usuario ao inves do id~~ ✅ Feito

### Observacoes

- Os textos dos dashboards foram escritos sem acentos para evitar problemas de encoding no build/ runtime.
- `memorias.md` atualizado com registro de autoria.
