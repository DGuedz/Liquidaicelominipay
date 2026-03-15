DG, abaixo está um **PROMPT ZERO completo** para iniciar o design do produto no hackathon. Ele já assume que estamos trabalhando com **Next.js + Tailwind + shadcn + MiniPay constraints (<2MB bundle)** e segue os princípios **Invisible DeFi + Regra dos 3 Toques + MVP first**.

Esse prompt pode ser usado diretamente no **Trae / Cloud Code / AI design agent / Cursor / Copilot**.

---

# PROMPT ZERO — DESIGN SYSTEM + UX

### Hackathon Build Mode

You are a **Senior Product Designer + UX Architect + Frontend Systems Designer** working on a **Web3 Fintech mobile-first application for a hackathon**.

Your mission is to design an **ultra-light, trust-driven financial interface** inspired by modern fintech apps such as **MiniPay, Revolut, and CashApp**, while respecting strict mobile performance constraints.

The application must feel like a **professional financial terminal**, not a typical crypto app.

---

# CONTEXT

We are building a **financial agent interface** that allows users to:

• manage balances
• route liquidity
• execute transfers
• visualize capital flows
• receive automated financial optimization

The UX must follow the **Invisible DeFi principle**:

Users should **not feel blockchain complexity**.
They should only see **money moving intelligently**.

---

# HARD CONSTRAINTS (Hackathon Mode)

Design must respect:

• Mobile-first
• 3G connection support
• Final bundle < 2MB
• No heavy UI frameworks
• Fast onboarding (<20s)

---

# DESIGN STACK

Frontend architecture:

Next.js
TailwindCSS
shadcn/ui
Lucide icons
Framer Motion (minimal)

Avoid:

Material UI
Bootstrap
Ant Design
Heavy charts libraries

---

# DESIGN PHILOSOPHY

Follow these principles:

### 1 — Trust First UX

Financial interfaces must prioritize **clarity and credibility**.

Use:

• large balances
• simple numbers
• minimal colors
• whitespace

Avoid:

• visual noise
• crypto jargon
• excessive gradients

---

### 2 — Rule of Three Taps

Every core action must be completed in **≤ 3 interactions**.

Examples:

Send money
Rebalance liquidity
Confirm execution

---

### 3 — Invisible DeFi

Do NOT expose:

• blockchain terminology
• gas fees
• smart contract language

Translate into:

Balance
Transfer
Yield
Optimization

---

# COLOR SYSTEM

Primary palette:

Background: `slate-950`
Surface: `slate-900`
Accent: `emerald-500`
Highlight: `cyan-400`

Status:

Success: `emerald-500`
Warning: `amber-400`
Error: `red-500`

---

# TYPOGRAPHY

Use system fonts:

Inter / system-ui

Financial numbers must use:

font-mono

Example:

```
$12,435.00
```

Large and highly readable.

---

# CORE SCREENS TO DESIGN

Design the following mobile screens.

---

# SCREEN 1 — DASHBOARD

Purpose:

User sees financial overview instantly.

Components:

• Balance Card
• Quick Actions
• Cashflow Overview
• Activity Summary

Layout:

```
Header
Balance Card

Send | Request | Optimize

Income Card
Spending Card

Cashflow Graph
```

Balance card example:

```
Your Balance
$12,435.00
```

Must dominate the screen.

---

# SCREEN 2 — TRANSFER FLOW

Step 1

Recipient card

```
Transfer to
Arnold Smith
```

Step 2

Numeric keypad input

```
$1000.00
```

Step 3

Confirm transaction.

---

# SCREEN 3 — TRANSACTION SUCCESS

Minimal feedback.

Components:

Success badge
Transaction details
Download receipt
Return home

Example:

```
✔ Payment Successful
```

---

# UI COMPONENTS

Design reusable components.

Required components:

BalanceCard
ActionButton
MetricCard
TransferInput
SuccessPanel
NavigationBar

All components must be:

• responsive
• lightweight
• reusable

---

# MICROINTERACTIONS

Use minimal motion:

Balance pulse on update
Success animation
Drawer transitions

Avoid heavy animations.

---

# NAVIGATION

Bottom navigation only.

Tabs:

Home
Analytics
Scan
Card
Profile

---

# DATA VISUALIZATION

Show simple financial insights:

Income
Spending
Cashflow trend

Use lightweight charts.

Prefer:

SVG
Recharts minimal mode

---

# SECURITY VISUAL SIGNALS

Financial apps must communicate safety.

Include:

Checkmarks
Success badges
Transaction IDs
Receipts

---

# ONBOARDING FLOW

User should reach dashboard in **under 20 seconds**.

Steps:

Open app
Auto connect wallet
Show balance
Enable actions

No long forms.

---

# VISUAL STYLE

Inspired by:

• Revolut
• CashApp
• MiniPay
• Apple Wallet

Characteristics:

Minimal
Modern
Financial-grade
Institutional trust

---

# DELIVERABLES

Generate:

1. Mobile dashboard UI
2. Transfer flow UI
3. Success confirmation screen
4. Component design system
5. Tailwind-ready layout structure

---

# OUTPUT FORMAT

Provide:

• component hierarchy
• layout description
• Tailwind classes suggestion
• design tokens

---

# GOAL

The final interface must look like:

"A next-generation financial operating system."

Users must feel:

• trust
• speed
• clarity
• financial control

---

# FINAL OBJECTIVE

Build an interface that:

• impresses hackathon judges
• works instantly on mobile
• communicates financial intelligence
• scales beyond the hackathon.

---

# EXTRA — HACKATHON STRATEGY

Prioritize:

1️⃣ Working product
2️⃣ Clean UX
3️⃣ Clear value

A simple product that works **beats a complex broken system**.

---

DG, se quiser, eu também posso te entregar a próxima peça crítica:

### **UI Architecture para Hackathon (nível vencedor)**

Incluindo:

* estrutura de pastas React
* design tokens
* componentes shadcn prontos
* layout do dashboard
* código inicial do app

Isso praticamente **acelera o build em 10x**.
