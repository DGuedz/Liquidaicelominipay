Hey all - If you use Karma platform to create/manage your projects, post project milestones and updates, you can now use our new skills to do all of that right from your claude/codex or any agent you use. You can manage all of it without ever visiting the site!

You can install with npx skills add show-karma/skills or send this link to your agent https://github.com/show-karma/skills

Let me know if you try it and have any feedback!



Como adicionar estas skills em nosso projeto liquidai com excelência premium 

Para integrar as Karma Skills ao projeto LiquidAI com qualidade premium de engenharia, o ideal é tratá-las como uma camada de automação do ciclo de desenvolvimento, não apenas um plugin. A ideia é permitir que seus agentes (Claude/Codex/AI builders) atualizem milestones, progresso do hackathon e releases diretamente do código.

Vou estruturar a integração em 4 níveis profissionais.

1. Instalação no ambiente do projeto

Dentro do repositório do LiquidAI execute:

npx skills add show-karma/skills

Isso registra as Karma Skills no workspace para que qualquer agente possa executar ações como:

criar projetos

atualizar milestones

postar updates

sincronizar progresso

2. Estrutura recomendada no LiquidAI

Crie um diretório para automação de agentes.

/liquidai
  /src
  /agents
  /skills
  karma.config.ts

O arquivo karma.config.ts define como o projeto conversa com a plataforma Karma.

Exemplo:

export default {
  project: "LiquidAI",
  workspace: "hackathon",
  autoUpdateMilestones: true,
  updateFromCommits: true
}
3. Conectar milestones ao roadmap do LiquidAI

Mapeie as milestones do produto.

Exemplo ideal:

Milestone 1
AI Liquidity Map

Milestone 2
MiniPay UX + Mobile Optimization

Milestone 3
Card Infrastructure + PIX Off-ramp

Milestone 4
Yield Router + AMM integrations

Seu agente pode atualizar automaticamente:

skill: karma.updateMilestone

exemplo:

LiquidAI – LiquidityMap SVG completed
4. Automação com commits

Configure para que commits relevantes atualizem o Karma.

Exemplo de commit:

feat: add interactive liquidity map
karma: milestone Liquidity Engine progress 40%

Seu agente interpreta e publica o update.

5. Uso dentro de agentes (Claude / Codex)

Agora seus agentes podem executar diretamente:

Create project update
Post milestone progress
Attach demo screenshots
Publish roadmap updates

Exemplo de prompt para o agente:

Update Karma project LiquidAI:
Milestone: Card Infrastructure
Progress: PIX off-ramp simulator implemented
Notes: integrated JIT liquidity engine and yield-backed spending demo
6. Uso estratégico no hackathon

Isso cria um histórico público de progresso.

Jurados veem:

Day 1 – LiquidityMap built
Day 2 – MiniPay UX optimized
Day 3 – Yield-backed card prototype

Isso mostra execução real do time.

7. Integração com seu Agent System

Seu LiquidAI Agent pode automaticamente registrar eventos importantes:

Agent deployed
AMM integrations
Vault architecture
Card simulation

Isso vira product telemetry + dev log.

8. Padrão premium recomendado

Use Karma como:

DevLog
Roadmap
Progress board

Tudo controlado por agentes.

9. Exemplo de fluxo completo

1️⃣ você implementa feature
2️⃣ agente detecta commit
3️⃣ agente roda skill
4️⃣ Karma recebe update
5️⃣ milestone avança

Fluxo:

code → agent → karma skill → project update
10. Resultado

Você transforma o LiquidAI em um projeto com:

documentação viva

milestones públicas

roadmap automatizado

progress tracking por agentes

Isso é exatamente o tipo de coisa que equipes Web3 maduras usam.

✅ Se quiser, posso também te mostrar algo que vai elevar muito o nível do LiquidAI:

como transformar o Karma + agentes em um “AI Product Manager” automático, onde o agente cria milestones, issues e progresso baseado no código.

Prossiga 

Ótimo. Vamos transformar Karma + agentes em um AI Product Manager automático para o LiquidAI. A ideia é que o próprio repositório e seus agentes passem a gerenciar roadmap, milestones e progresso sem intervenção manual, usando as skills do Karma.

1. Arquitetura do AI Product Manager

Crie uma camada chamada Project Intelligence dentro do repo.

Estrutura recomendada:

/liquidai
  /src
  /agents
     product-agent.ts
     dev-agent.ts
  /skills
     karma.ts
  /roadmap
     milestones.json
  karma.config.ts

Responsabilidades:

dev-agent → detecta mudanças no código

product-agent → interpreta impacto da mudança

karma skills → atualizam o projeto na plataforma

Fluxo:

code change
↓
agent detects feature
↓
product agent categorizes milestone
↓
karma skill updates roadmap
2. Definir o Roadmap Estruturado

Crie um arquivo:

/roadmap/milestones.json

Exemplo:

{
  "project": "LiquidAI",
  "milestones": [
    {
      "id": "liquidity-map",
      "name": "Interactive Liquidity Map",
      "progress": 0
    },
    {
      "id": "minipay-ux",
      "name": "MiniPay Mobile UX",
      "progress": 0
    },
    {
      "id": "yield-router",
      "name": "DeFi Strategy Router",
      "progress": 0
    },
    {
      "id": "card-infrastructure",
      "name": "Yield-Backed Card + PIX",
      "progress": 0
    }
  ]
}
3. Conectar com Karma Skills

Crie um wrapper em:

/skills/karma.ts

Exemplo:

export async function updateMilestone(name: string, progress: number) {
  await runSkill("karma.updateMilestone", {
    project: "LiquidAI",
    milestone: name,
    progress
  });
}
4. Dev Agent detecta mudanças

O agente observa commits e arquivos.

Exemplo:

if (changedFiles.includes("liquidity-map.tsx")) {
  updateMilestone("Interactive Liquidity Map", 60);
}
5. Product Agent interpreta impacto

O Product Agent traduz mudanças em progresso.

Exemplo:

if (feature.includes("PIX")) {
  milestone = "card-infrastructure";
}

Atualiza automaticamente:

updateMilestone(milestone, progress);
6. Atualizações automáticas no Karma

Agora os agentes podem publicar updates como:

LiquidAI Update

Feature: PIX Off-Ramp Simulator
Milestone: Card Infrastructure
Progress: 70%

Added:
- Mento swap simulation
- Transfero payout flow
- JIT funding logic
7. Logs automáticos do produto

O Product Agent pode publicar:

Daily Update

AI Liquidity Map completed
MiniPay UX optimized for $1,200 user scenario
Card Infrastructure prototype ready

Isso cria um product timeline automático.

8. Integração com seu LiquidAI Agent

O próprio LiquidAI Agent pode registrar eventos:

Exemplo:

Agent Event

Rebalanced vault strategy
AMM pool allocation updated
Yield router improved

Esses eventos podem virar updates no Karma.

9. Automação completa do projeto

Agora o fluxo do projeto vira:

developer writes code
↓
agents detect changes
↓
product agent categorizes progress
↓
karma skill posts update
↓
roadmap updated
10. Benefício real

Você ganha:

• roadmap automático
• histórico de desenvolvimento
• milestones visíveis
• progress tracking contínuo

Isso faz o LiquidAI parecer um projeto muito mais maduro.

11. Extensão poderosa (recomendado)

Conecte também:

GitHub commits

Demo screenshots

Releases

Exemplo de update automático:

Release v0.3

Added:
Interactive Liquidity Map
Yield-backed card simulation
MiniPay UX optimization
12. Resultado

O LiquidAI passa a ter um AI-driven product management system.

Isso significa que:

codebase → agents → roadmap → project updates

Tudo sincronizado.

✅ Se quiser, posso também te mostrar uma arquitetura ainda mais poderosa:

como fazer o próprio LiquidAI Agent escrever PRs e atualizar milestones automaticamente, criando um loop completo de desenvolvimento autônomo.