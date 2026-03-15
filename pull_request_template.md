## 🌊 LiquidAI — Pull Request

### 📋 Descrição

<!-- Descreva brevemente o que esse PR faz -->

### 🔗 Issue Relacionada

<!-- Closes #xxx -->

### 📸 Screenshots / Vídeo

<!-- Adicione screenshots ou GIFs mostrando a mudança, especialmente para UI -->

---

### ✅ Checklist

#### Geral
- [ ] O código compila sem erros (`pnpm build`)
- [ ] TypeScript sem erros (`pnpm tsc --noEmit`)
- [ ] Testei no mobile (390px / iPhone SE viewport)
- [ ] Testei no modo dark e light

#### UI/UX
- [ ] Segue a paleta verde fintech (#0D4B2E, #A3D977)
- [ ] Usa ícones da biblioteca `/src/app/components/icons.tsx` (não emojis)
- [ ] Ação principal em ≤ 3 toques (regra dos 3 toques)
- [ ] Animações suaves com Motion (motion/react)

#### Código
- [ ] Componentes estão em `/src/app/components/`
- [ ] Sem console.log() esquecido
- [ ] Sem `any` no TypeScript (use tipos explícitos)
- [ ] Keys únicas em listas (`.map()`)

#### Integração Celo
- [ ] Endereços de contrato são variáveis de ambiente (`VITE_*`)
- [ ] Tratamento de erro para falhas de RPC
- [ ] Feature flags configuradas no `.env.example`

---

### 🧪 Como Testar

<!-- Descreva o passo a passo para revisar esse PR -->
1. 
2. 
3. 

### 📝 Notas para o Reviewer

<!-- Qualquer contexto adicional que o reviewer precise saber -->
