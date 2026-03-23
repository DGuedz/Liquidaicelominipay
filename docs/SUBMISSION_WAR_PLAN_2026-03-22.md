# Submission War Plan (Urgente) - 2026-03-22

Objetivo: garantir submissão hoje com demo funcional de `Multi-Wallet + Self Protocol`, sem quebrar produção.

## 0) Regras de guerra (5 min)
- Freeze de escopo: **sem features novas**.
- Só entra correção de:
  - boot da API,
  - conexão de wallet,
  - start/poll Self,
  - timeout/refresh/suporte.
- Deploy sempre com Node `22`.
- Nada sensível no GitHub (estratégias internas fora de commit público).

## 1) Gate 1: API de produção de pé (20 min)
Checklist:
- Confirmar branch e commit que o Render está deployando.
- Garantir import correto em `agent-squad.mjs`:
  - `import { isSelfVerified } from "../store/self-store.mjs";`
- Redeploy com cache limpo.

Comandos de validação:
```bash
curl -sS https://liquidaicelominipay.onrender.com/api/health
curl -sS "https://liquidaicelominipay.onrender.com/api/self/status?address=0xd93b0a6bdf9c53717b2ae9890d2b21969fba9fc7"
```

Critério de aceite:
- `/api/health` -> `ok: true`.
- `/api/self/status` -> `ready: true`, `mode: "agent"`.

## 2) Gate 2: Fluxo Self ponta a ponta (35 min)
Checklist:
- Conectar wallet A.
- `Unlock with Self ID` abre deep link/QR válido.
- Finalizar no app Self.
- Poll retorna `verified=true`.
- Refresh da página mantém estado via `/api/self/status`.

Critério de aceite:
- Sem erro 400/403 indevido no caminho feliz.
- Sem sessão antiga vazando entre wallets.

## 3) Gate 3: Multi-wallet real (25 min)
Checklist:
- Conectar wallet A -> desconectar -> conectar wallet B.
- Confirmar SIWE novo (sem token fantasma).
- Tentar connector `BLOCKED/MISSING` e validar erro claro.
- Wallet `READY` conecta exatamente a escolhida.

Critério de aceite:
- Nenhum mismatch de endereço/token.
- UI mostra status de connector em tempo real (`READY/BLOCKED/MISSING`).

## 4) Gate 4: Timeout e recuperação Self (20 min)
Checklist:
- Forçar timeout (não concluir biometria).
- Validar ações:
  - `Tentar novamente` reinicia fluxo,
  - `Reiniciar` reseta estado,
  - `Abrir suporte` leva contexto do incidente.
- Testar refresh após timeout.

Critério de aceite:
- Usuário sempre consegue retomar sem travar sessão.

## 5) Empacotamento de submissão (40 min)
Entregáveis mínimos:
- Vídeo demo curto (2-3 min):
  - Connect wallet,
  - Self verify,
  - troca de wallet,
  - recuperação de timeout.
- README/Docs atualizados:
  - arquitetura curta,
  - envs críticas,
  - como rodar.
- Mapeamento de bounties com evidência no projeto:
  - Self Protocol,
  - Celo,
  - demais parceiros aplicáveis.

## 6) Plano de contingência (se Gate 2 falhar) (15 min)
Se Self real falhar faltando pouco tempo:
- Manter app estável em produção.
- Submeter build com:
  - fluxo wallet + segurança + debug connectors funcionando,
  - evidência de integração Self no código e endpoints.
- Registrar no submission notes:
  - incidente específico,
  - endpoint afetado,
  - correção planejada pós-submissão.

## 7) Ordem exata de execução hoje
1. Corrigir/confirmar commit que está no Render.
2. Redeploy + validar Gate 1.
3. Rodar QA rápido Gates 2, 3 e 4.
4. Gravar vídeo imediatamente após passar.
5. Submeter hackathons antes do cutoff.

## 8) GO / NO-GO final
`GO` se:
- API saudável,
- 1 fluxo Self completo funcional,
- troca A->B sem mismatch,
- timeout com recuperação funcionando.

`NO-GO` se:
- API não sobe,
- Self nem inicia sessão/deep link,
- mismatch crítico entre wallet e sessão.
