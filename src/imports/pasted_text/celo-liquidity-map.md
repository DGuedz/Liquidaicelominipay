Aqui está um **PROMPT CONTEXT otimizado** para integrar **as principais pools e AMMs do ecossistema Celo** dentro do **Interactive AI Liquidity Map (SVG)** do LiquidAI. Ele já está estruturado para uso em **AI coding agents / Cursor / Copilot / Trae**.

---

# PROMPT CONTEXT — Celo Liquidity Ecosystem Integration (SVG Liquidity Map)

You are a senior fintech visualization engineer building an **Interactive AI Liquidity Map (SVG)** for the LiquidAI dashboard.

The goal is to expand the current visualization so the **AI Agent dynamically routes capital across the main DeFi liquidity venues in the Celo ecosystem**, turning the user wallet into an automated **micro-AMM liquidity router**.

The map must visually represent how the **LiquidAI agent analyzes idle capital and allocates liquidity across multiple protocols**.

---

# CORE UX CONCEPT

The visualization must show **capital literally moving across the network**.

User action:

```
Tap → Optimize Liquidity
```

Animation flow:

```
Idle Balance
↓
AI Agent Decision
↓
Liquidity Routing
↓
Protocol Pools
↓
Yield Captured
```

Particles move through SVG paths to demonstrate **capital reallocation across DeFi protocols**.

---

# PROTOCOL NODES TO ADD

Expand the liquidity map to include the main **Celo DeFi venues** grouped by category.

### Stable Pools / AMMs

* Mento Protocol
* Curve Finance
* Uniswap v3

These represent **stablecoin and concentrated liquidity markets**.

---

### Lending Pools

* Aave v3
* Moola Market
* PWN

These nodes represent **capital lending and borrow markets**.

---

### RWA / Receivable Pools

* Untangled Finance
* Credit Collective
* EthicHub

These nodes represent **real-world asset yield strategies**.

---

### Additional Ecosystem Liquidity

* Morpho
* Sushi
* PoolTogether
* Ubeswap

These should appear as **secondary liquidity destinations**.

---

# VISUAL STRUCTURE

Design the liquidity map as a **network topology centered on the AI Agent**.

Example structure:

```
          Curve
            ●
             \
Mento ●--- AI Agent ---● Aave
             /
        Uniswap v3

     Untangled ●   ● EthicHub
```

Nodes should represent:

* Idle Balance
* AI Agent
* Liquidity venues

---

# NODE DESIGN

Each protocol node should include:

* circle or soft node
* protocol label
* category color

Example color system:

```
Stable AMMs → emerald
Lending → cyan
RWA pools → amber
Other liquidity → slate
```

---

# CAPITAL FLOW ANIMATION

When optimization is triggered:

1. Idle Balance node pulses
2. AI Agent activates
3. Particles move along selected paths
4. Destination node glows
5. Yield counter increases

Use:

```
<animateMotion>
SVG path
particle circles
```

Particles represent **capital movement**.

---

# AI ROUTING LOGIC (VISUAL)

Simulate decision logic.

Example sequence:

```
Idle Balance
↓
AI Agent
↓
Aave v3
↓
Curve
↓
Yield captured
```

This should change on every run to show **dynamic routing**.

---

# PERFORMANCE REQUIREMENTS

The map must remain:

* SVG only
* lightweight
* mobile-friendly
* under minimal bundle size

Avoid chart libraries.

Use **pure SVG + React state + CSS transitions**.

---

# DEMO OBJECTIVE

The visualization must clearly communicate:

• AI-driven capital routing
• Celo ecosystem connectivity
• automated yield optimization
• LiquidAI turning wallets into **micro-AMMs**

The experience should feel like a **live liquidity network controlled by AI**.

---

Se quiser, posso também criar a **versão visual ideal desse mapa (arquitetura SVG)** com:

* **topologia perfeita para demo**
* **clusters por categoria DeFi**
* **layout tipo “liquidity brain”**

Esse tipo de visual costuma ser **o momento mais impressionante do pitch em hackathons**.
