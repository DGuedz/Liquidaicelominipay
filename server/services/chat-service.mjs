function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function safeMonthlyTarget(summary) {
  return Number(summary.monthlyYieldUsd || 0);
}

function recommendedRebalanceAmount(dashboard) {
  const managed = Number(dashboard.summary.managedCapitalUsd || 0);
  if (managed === 0) return 0;
  return Number.parseFloat(Math.max(1, Math.min(managed * 0.25, managed)).toFixed(2));
}

export function generateChatReply({ message, dashboard }) {
  const text = String(message || "").toLowerCase();
  const summary = dashboard.summary;
  const bestProtocol = dashboard.marketOpportunity.protocol;

  const baseContext = {
    capital: summary.managedCapitalUsd.toFixed(2),
    balance: summary.balanceUsd.toFixed(2),
    apy: summary.apy.toFixed(2),
    dailyYield: (summary.monthlyYieldUsd / 30).toFixed(2),
    bestProtocol,
  };

  if (includesAny(text, ["pix", "send", "pay", "transfer", "withdraw", "fx", "enviar", "pagar", "transferir", "saque"])) {
    return {
      type: "text",
      thinkingSteps: ["Monitoring Mento V3 oracles for best BRLm rate...", "Activating Smart Remittance..."],
      text: `You have **$${summary.liquidityBufferUsd.toFixed(2)}** in the immediate buffer. Need more? The **Self-Repaying Micro-Credit** can advance you BRLm instantly without breaking your DeFi position.\n\nFlow:\n1. Agent locks USDm in Vault.\n2. Advances BRLm via PIX.\n3. Debt is paid automatically by your Vault's yield.`,
    };
  }

  if (includesAny(text, ["balance", "wallet", "how much", "funds", "saldo", "carteira", "quanto"])) {
    return {
      type: "text",
      thinkingSteps: ["Reading on-chain balance...", "Splitting immediate buffer and yield vault..."],
      text: `Your total balance is **$${baseContext.balance}**.\n\n• Vault (Yield): **$${baseContext.capital}**\n• Immediate Buffer (MiniPay): **$${summary.liquidityBufferUsd.toFixed(2)}**\n• Current APY: **${baseContext.apy}%**`,
    };
  }

  if (includesAny(text, ["today", "activity", "summary", "log", "hoje", "atividade", "resumo"])) {
    const events = dashboard.agentEvents.slice(0, 3).map((event, index) => `${index + 1}. ${event}`).join("\n");
    return {
      type: "insight",
      thinkingSteps: ["Querying fee abstraction logs...", "Consolidating LP optimizations..."],
      text: `Today's summary:\n${events}\n\nEstimated daily yield: **+$${baseContext.dailyYield}** (Gas paid in USDm).`,
    };
  }

  if (includesAny(text, ["maximize", "yield", "opportunity", "optimize", "earn", "maximizar", "oportunidade", "otimizar"])) {
    const amount = recommendedRebalanceAmount(dashboard);
    if (amount === 0) {
      return {
        type: "text",
        thinkingSteps: ["Checking available capital...", "No capital available"],
        text: "You don't have enough balance to optimize right now. Please add funds to your wallet to start generating yield.",
      };
    }
    const gain = ((amount * dashboard.marketOpportunity.apy) / 100 / 12).toFixed(2);
    return {
      type: "action",
      thinkingSteps: ["Evaluating A2A Dark Pool matches...", "Batching via Gas-Optimized routing..."],
      text: "I identified an opportunity to increase your yield without AMM slippage. The protocol retains a 10% performance fee only on the extra yield generated.",
      actionData: {
        id: "rebalance-90",
        title: `Gas-Optimized Routing $${amount.toFixed(2)} to ${dashboard.marketOpportunity.protocol}`,
        amount: `$${amount.toFixed(2)}`,
        gain: `+$${gain}/month`,
        risk: "Low",
        riskColor: "#10B981",
        protocol: `${dashboard.marketOpportunity.protocol} · Celo`,
      },
    };
  }

  return {
    type: "text",
    thinkingSteps: ["Evaluating intent...", "Analyzing liquidity and unfair advantages..."],
    text: `I am your Liquidity Agent for MiniPay.\n\nProtected balance: **$${baseContext.balance}**.\nImmediate buffer: **$${summary.liquidityBufferUsd.toFixed(2)}**.\n\nI can execute **Smart Remittances** (waiting for the best FX rate), match trades in our **A2A Dark Pool** to avoid slippage, or provide **Self-Repaying Credit** so you never have to break your yield position.`,
  };
}
