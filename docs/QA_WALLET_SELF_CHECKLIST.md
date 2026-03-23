# QA Checklist: Wallet & Self Protocol Flow

**Data do Teste:** `[  /  /  ]`  
**Testador:** `[            ]`  
**Ambiente:** `[ Preview / Produção / Local ]`  
**Dispositivo/OS:** `[            ]`

## 1. Preparação (2 min)
- [ ] Frontend rodando no ambiente correto com as envs: `VITE_ALLOW_VERCEL_PREVIEW`, `VITE_ALLOWED_APP_HOSTS`, `VITE_APP_URL`.
- [ ] Backend online (endpoint `/api/health` respondendo 200 OK).
- [ ] Possuir pelo menos 2 wallets EVM instaladas/disponíveis (ex: MetaMask + Rabby ou TrustWallet).
- **Status:** `[ PASS / FAIL ]`
- **Notas:**

---

## 2. Gate de Domínio Confiável (2 min)
- [ ] **Teste Positivo:** Acessar o app em um domínio permitido (ex: `*.vercel.app` se configurado, ou localhost). 
  - *Esperado:* Não deve exibir erro de "untrusted domain".
- [ ] **Teste Negativo:** Acessar o app em um domínio não autorizado (pode ser simulado via ngrok/túnel não listado).
  - *Esperado:* Bloquear a conexão e exibir mensagem clara informando o host atual e os permitidos (allowlist).
- **Status:** `[ PASS / FAIL ]`
- **Notas:**

---

## 3. Seleção de Connector (3 min)
- [ ] Na tela de onboarding, abrir o painel "Wallet debug" ou a lista de conectores.
  - *Esperado:* Cada wallet exibe corretamente seu status (`READY`, `BLOCKED` ou `MISSING`).
- [ ] Tentar conectar usando uma wallet com status `MISSING` ou `BLOCKED`.
  - *Esperado:* A ação não prossegue e um erro claro é exibido ao usuário.
- [ ] Clicar em uma wallet com status `READY`.
  - *Esperado:* A aplicação solicita conexão exatamente na wallet escolhida, sem realizar um fallback silencioso para outra extensão ativa.
- **Status:** `[ PASS / FAIL ]`
- **Notas:**

---

## 4. Sessão de Auth por Wallet (2 min)
- [ ] Conectar a **Wallet A** e avançar no fluxo até o estado conectado.
- [ ] Desconectar a Wallet A usando a UI da aplicação.
- [ ] Conectar a **Wallet B**.
  - *Esperado:* A sessão e a autenticação do backend atualizam corretamente para o endereço da Wallet B, sem "mismatch" ou cache de endereço antigo.
- **Status:** `[ PASS / FAIL ]`
- **Notas:**

---

## 5. Fluxo Self (Proof of Humanity) (3–4 min)
- [ ] Com uma wallet conectada, iniciar a ação `Unlock with Self ID` (ou equivalente).
  - *Esperado:* O sistema inicia a sessão de registro, gera o Deep Link/QR Code e começa a fazer o *polling* do status no backend.
- [ ] Escanear o QR Code/Deep Link com o app Self e concluir o fluxo de biometria.
  - *Esperado:* O *polling* do frontend detecta o sucesso e a UI atualiza para o status verificado.
- [ ] Recarregar a página (F5) após a verificação bem-sucedida.
  - *Esperado:* O endpoint `/api/self/status` continua retornando `verified=true` para o endereço da wallet atual, mantendo a sessão ativa.
- **Status:** `[ PASS / FAIL ]`
- **Notas:**

---

## 5.1 Timeout, Refresh e Suporte (2–3 min)
- [ ] Forçar cenário de timeout (não concluir a biometria e aguardar expiração).
  - *Esperado:* UI exibe erro claro de timeout e registra incidente de suporte.
- [ ] Clicar em **Tentar novamente**.
  - *Esperado:* Novo ciclo de `start-registration` é iniciado (sem reaproveitar sessão antiga).
- [ ] Recarregar a página (F5) após timeout.
  - *Esperado:* Fluxo retorna em estado seguro e permite reiniciar a verificação.
- [ ] Clicar em **Abrir suporte** no card de timeout.
  - *Esperado:* Navegação para suporte/chat com contexto do incidente (`issue=self-timeout`, wallet e timestamp).
- **Status:** `[ PASS / FAIL ]`
- **Notas:**

---

## 6. Critério Final de Aceite (Verificação de Erros Críticos)
- [ ] Conexão permitida apenas em domínios autorizados.
- [ ] Bloqueio eficaz com mensagens diagnósticas úteis em domínios não permitidos.
- [ ] Escolha da wallet respeitada (sem conflito de injeção).
- [ ] Fluxo ZK/Self concluído sem vazamento de sessão ou troca de endereço.
- [ ] Inspecionar o console do navegador: nenhum erro crítico (`Uncaught Exception`, CORS em rotas vitais, ou vazamento de segredos) durante o caminho feliz.
- **Status Geral da Release:** `[ GO / NO-GO ]`
- **Aprovado por:** `[            ]`

---

## 7. Tabela de Evidências (Registro de Auditoria)
*Preencha esta tabela para manter o histórico das validações e anexar a Pull Requests / Releases.*

| Teste | URL Testada | Wallet Usada | Print/Log (Link) | Resultado (Pass/Fail) | Observação |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gate de Domínio** | | | | | |
| **Bloqueio de Domínio** | | | | | |
| **Conexão Wallet A** | | | | | |
| **Conexão Wallet B** | | | | | |
| **Fluxo Self ZK** | | | | | |
| **Persistência de Auth** | | | | | |

---
*Documento gerado para garantir a integridade da arquitetura de Multi-Wallet e Sybil-Resistance antes de merges críticos.*
