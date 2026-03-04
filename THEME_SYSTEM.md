# Sistema de Temas - NolevelBOT

## Visão Geral

A aplicação agora possui um sistema de temas completo com suporte para modo escuro e claro, utilizando as cores personalizadas fornecidas.

## Funcionalidades

### 1. **Switch de Tema**
- Botão flutuante no canto superior direito da tela
- Alterna entre tema claro e escuro
- Preferência é salva no localStorage
- Transições suaves entre temas

### 2. **Cores Implementadas**

#### Tema Escuro (Padrão)
- **Fundo principal**: `#0F172A`
- **Superfícies**: `#111827`
- **Camada elevada**: `#1F2937`
- **Bordas**: `#2D3748`
- **Texto principal**: `#F3F4F6`
- **Texto secundário**: `#9CA3AF`

#### Cores de Status
- **Novo**: `#60A5FA` (Azul claro)
- **Em Andamento**: `#FBBF24` (Amarelo)
- **Aguardando**: `#C084FC` (Roxo)
- **Concluído**: `#22C55E` (Verde)
- **Cancelado**: `#F87171` (Vermelho)

#### Cor Primária
- **Azul Vibrante**: `#3B82F6`
- **Hover**: `#2563EB`
- **Destaque Secundário**: `#22D3EE` (Cyan)

### 3. **Componentes Estilizados**
Todos os componentes foram atualizados para:
- Suportar transições suaves entre temas
- Usar variáveis CSS para cores
- Manter consistência visual
- Responder ao estado de tema

### 4. **Variáveis CSS**

As variáveis estão definidas em `src/app/globals.css`:

```css
--background          /* Fundo principal */
--foreground          /* Texto principal */
--surface             /* Superfícies como cards */
--surface-elevated    /* Elementos elevados */
--border-subtle       /* Bordas sutis */
--primary             /* Cor primária */
--primary-hover       /* Hover da cor primária */
--accent-secondary    /* Destaque secundário */
--status-new          /* Status novo */
--status-in-progress  /* Status em andamento */
--status-waiting      /* Status aguardando */
--status-completed    /* Status concluído */
--status-cancelled    /* Status cancelado */
```

## Como Usar

### Para Adicionar uma Nova Cor

1. Adicione a variável em `src/app/globals.css`:
```css
:root {
  --nova-cor: #ffffff;
}

[data-theme="dark"] {
  --nova-cor: #0a0a0a;
}
```

2. Use em seus componentes:
```tsx
<div style={{ color: "var(--nova-cor)" }}>
  Texto com nova cor
</div>
```

### Para Criar um Novo Componente

Sempre use as variáveis CSS:

```tsx
<button
  style={{
    backgroundColor: "var(--primary)",
    color: "var(--foreground)",
    borderColor: "var(--border-subtle)",
  }}
>
  Meu Botão
</button>
```

### Para Acessar o Tema

Use o hook `useTheme`:

```tsx
"use client";

import { useTheme } from "@/app/providers";

export default function MeuComponente() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Tema atual: {theme}</p>
      <button onClick={toggleTheme}>Alternar Tema</button>
    </div>
  );
}
```

## Páginas Atualizadas

- ✅ `src/app/page.tsx` - Página inicial
- ✅ `src/app/(atendimento)/all-tickets/page.tsx` - Lista de chamados
- ✅ `src/app/(atendimento)/avisos/page.tsx` - Quadro de avisos
- ✅ `src/app/(atendimento)/cadastro_cpfs/page.tsx` - Cadastro de CPFs
- ✅ `src/app/chamado/[ticket]/page.tsx` - Formulário de chamado
- ✅ `src/app/(atendimento)/components/modal_tandimento.tsx` - Modal de atendimento

## Estrutura de Arquivos

```
src/
├── app/
│   ├── globals.css           # Variáveis de tema
│   ├── layout.tsx            # Provider de tema
│   ├── providers.tsx         # Context do tema
│   ├── components/
│   │   └── theme-toggle.tsx  # Switch de tema
│   ├── page.tsx              # Página inicial
│   ├── (atendimento)/
│   │   ├── all-tickets/page.tsx
│   │   ├── avisos/page.tsx
│   │   ├── cadastro_cpfs/page.tsx
│   │   └── components/
│   │       └── modal_tandimento.tsx
│   └── chamado/
│       └── [ticket]/page.tsx
```

## Transições

Todas as mudanças de cor possuem transições suaves de 300ms:

```css
transition-colors duration-300
```

Isso cria uma experiência fluida ao alternar entre temas.

## Notas Técnicas

- O tema é armazenado em `localStorage` com a chave `"theme"`
- O padrão é tema escuro (`"dark"`)
- Use `[data-theme="dark"]` ou `[data-theme="light"]` para media queries customizadas
- Todos os inputs e textareas têm transições de cor
- Botões têm animações de hover e press

## Suporte do Navegador

O sistema usa:
- CSS Variables (suportado em todos os navegadores modernos)
- localStorage (suportado em todos os navegadores)
- Transições CSS3 (suportado em todos os navegadores modernos)

Compatível com: Chrome, Firefox, Safari, Edge (versões recentes)
