# Contribuindo com o LiquidAI 🌊

Obrigado pelo interesse em contribuir! Este documento descreve como participar do desenvolvimento.

## 🚀 Setup do Ambiente

```bash
# 1. Fork e clone o repositório
git clone https://github.com/DGuedz/liquidai.git
cd liquidai

# 2. Instale as dependências
pnpm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Preencha os valores em .env.local

# 4. Inicie o servidor de desenvolvimento
pnpm dev
```

## 🌿 Convenção de Branches

```
main          → produção (deploy automático)
develop       → integração
feature/xxx   → novas features (ex: feature/agent-rebalance)
fix/xxx       → correções (ex: fix/home-chart-render)
chore/xxx     → manutenção (ex: chore/update-deps)
```

## 📝 Convenção de Commits

Seguimos [Conventional Commits](https://conventionalcommits.org):

```
feat: adiciona widget AgentPulse na home
fix: corrige renderização do sparkline no dark mode
chore: atualiza motion para 11.x
docs: adiciona documentação da API de yield
style: ajusta espaçamento do card de saldo
refactor: extrai hook useAgentEvents
```

## 🎨 Padrões de UI/UX

### Paleta de Cores
```
Primário escuro:  #0D4B2E (verde floresta)
Primário médio:   #1a6b45 (verde médio)
Accent:           #A3D977 (verde lima)
Success:          #10B981
Warning:          #F59E0B
Error:            #EF4444
```

### Regras de Componentes
1. **Mobile-first** — viewport alvo: 390px (iPhone SE / MiniPay)
2. **3 toques** — qualquer ação em ≤ 3 interações
3. **Ícones SVG** — use `/src/app/components/icons.tsx`, não emojis
4. **Animações** — use `motion/react`, não CSS animations
5. **Tipografia** — sans-serif para texto, monospace para valores financeiros

### Estrutura de Arquivos
```
src/app/
├── components/     → Componentes reutilizáveis
├── pages/          → Páginas (uma por rota)
├── hooks/          → Custom hooks
├── styles/         → CSS global e tema
└── routes.ts       → Definição de rotas
```

## 🔍 Code Review

Todo PR precisa de:
- ✅ Build passando (`pnpm build`)
- ✅ TypeScript sem erros
- ✅ Testado em mobile (390px)
- ✅ Screenshot/vídeo para mudanças de UI

## 📞 Dúvidas?

- Abra uma [Issue](https://github.com/DGuedz/liquidai/issues)
- Twitter: [@dg_doublegreen](https://twitter.com/dg_doublegreen)
