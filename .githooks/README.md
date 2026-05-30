# Git Hooks — Fluxo sink-only da branch `testes`

## Hooks

| Hook | Arquivo | Função |
|------|---------|--------|
| pre-merge-commit | `.githooks/pre-merge-commit` | Impede merge da `testes` em outras branches |
| pre-push | `.githooks/pre-push` | Impede push da `testes` para refs que não sejam `testes` |

## Ativação

```bash
git config core.hooksPath .githooks
```

## Verificar

```bash
git config core.hooksPath
# Deve retornar: .githooks
```
