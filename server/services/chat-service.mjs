function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function safeMonthlyTarget(summary) {
  return Number(summary.monthlyYieldUsd || 0);
}

function recommendedRebalanceAmount(dashboard) {
  const managed = Number(dashboard.summary.managedCapitalUsd || 0);
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

  if (includesAny(text, ["saldo", "carteira", "quanto tenho"])) {
    return {
      type: "text",
      thinkingSteps: ["Lendo saldo on-chain...", "Consolidando liquidez + yield..."],
      text: `Seu saldo total é **$${baseContext.balance}**.\n\n• Capital produtivo: **$${baseContext.capital}**\n• Liquidez imediata: **$${summary.liquidityBufferUsd.toFixed(2)}**\n• APY blended atual: **${baseContext.apy}%**`,
    };
  }

  if (includesAny(text, ["hoje", "atividade", "resumo"])) {
    const events = dashboard.agentEvents.slice(0, 3).map((event, index) => `${index + 1}. ${event}`).join("\n");
    return {
      type: "insight",
      thinkingSteps: ["Consultando log do agente...", "Consolidando operações do dia..."],
      text: `Resumo de hoje:\n${events}\n\nYield estimado do dia: **+$${baseContext.dailyYield}**.`,
    };
  }

  if (includesAny(text, ["maximizar", "yield", "oportunidade", "otimizar"])) {
    const amount = recommendedRebalanceAmount(dashboard);
    const gain = ((amount * dashboard.marketOpportunity.apy) / 100 / 12).toFixed(2);
    return {
      type: "action",
      thinkingSteps: ["Mapeando APYs em Aave/Morpho/Mento...", "Calculando rebalance com limite de risco..."],
      text: "Encontrei uma oportunidade para aumentar seu retorno com baixo atrito.",
      actionData: {
        id: "rebalance-90",
        title: `Realocar $${amount.toFixed(2)} para ${dashboard.marketOpportunity.protocol}`,
        amount: `$${amount.toFixed(2)}`,
        gain: `+$${gain}/mês`,
        risk: "Baixo",
        riskColor: "#10B981",
        protocol: `${dashboard.marketOpportunity.protocol} · Celo`,
      },
    };
  }

  if (includesAny(text, ["pix", "enviar", "pagar", "transferir"])) {
    return {
      type: "text",
      thinkingSteps: ["Verificando buffer de liquidez...", "Conferindo disponibilidade instantânea..."],
      text: `Você tem **$${summary.liquidityBufferUsd.toFixed(2)}** disponíveis para pagamentos imediatos.\n\nFluxo em 3 toques:\n1. Enviar\n2. Selecionar contato\n3. Confirmar valor`,
    };
  }

  return {
    type: "text",
    thinkingSteps: ["Analisando sua solicitação...", "Buscando melhor ação com risco controlado..."],
    text: `Sou seu agente financeiro autônomo na Celo.\n\nSaldo atual monitorado: **$${baseContext.balance}**.\nLiquidez imediata disponível: **$${summary.liquidityBufferUsd.toFixed(2)}**.\nMelhor alvo de rendimento no momento: **${baseContext.bestProtocol}** com APY de **${dashboard.marketOpportunity.apy.toFixed(2)}%**.\nMeta mensal atual: **+$${safeMonthlyTarget(summary).toFixed(2)}**.`,
  };
}
