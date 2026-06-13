Aqui está o plano de ação consolidado, separado por o que pode ser resolvido no proxy.ts (sem tocar nas APIs) vs o que requer mudança nas rotas (precisa de sua autorização).
📋 Plano de Ação — Correção de Vulnerabilidades
🔵 Grupo A — Só no proxy.ts (não preciso mexer em API)
#	Vulnerabilidade	Como resolver
A1	X-Powered-By: Next.js exposto	Adicionar removeHeader no proxy
A2	Headers de segurança ausentes	Adicionar CSP, X-Frame-Options, X-Content-Type-Options no proxy
A3	/api-docs público	Proxy pode bloquear se não tiver token de sessão, ou redirecionar para login
A4	Rate limiting em GETs	Adicionar rate check no proxy (já existe rate-limit.ts)
A5	Brute force sem bloqueio	Já existe needsCaptcha() + Turnstile no login, mas só protege por email. Falta bloqueio por IP
🟡 Grupo B — Requer autorização para alterar API routes


#	Vulnerabilidade	O que precisa mudar
B1	GET /api/cpfs/general_cpf vaza CPFs	Adicionar API Key (header X-API-Key) validada contra env var. Bots enviam a key, público não acessa
B2	GET /api/empresa?cpf=xxx vaza dados internos	Remover id, botPrompt, botPresentation, logoUrl da resposta pública. Devolver só o necessário pro chatbot
B3	POST /api/tickets sem auth check	Adicionar verificação de sessão OU manter público mas com API Key (igual ao general_cpf)
B4	Webhooks públicos (/api/webhook26, etc.)	Auditar se precisam ser realmente públicos ou se podem receber uma API Key fixa
🟢 Grupo C — Infraestrutura (fora do código Next.js)



#	Vulnerabilidade	O que precisa fazer
C1	Evolution API na porta 8080 pública	Bloquear porta 8080 no firewall/nginx para acesso externo. Só o container Next.js deve acessar
C2	Cookies sem Secure	Só é resolvido com HTTPS ativo. Adicionar HTTPS no proxy reverso (nginx)
C3	/manager da Evolution API público	Colocar autenticação básica no nginx para o path /manager


🔥 Prioridade de Execução
Imediata (proxy.ts):       A1 → A2 → A3 → A4/A5
Precisa de autorização:    B1 → B2 → B3 → B4
Infraestrutura:            C1 → C2 → C3
Quer começar pelo Grupo A (só mexa no proxy.ts, zero risco de quebrar APIs)? Consigo implementar tudo em minutos. Depois, se autorizar, vou para o Grupo B.