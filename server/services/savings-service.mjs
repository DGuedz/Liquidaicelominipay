import { addGoal, getGoals, updateGoal } from "../store/session-store.mjs";

function toRounded(value, digits = 2) {
  return Number.parseFloat(value.toFixed(digits));
}

function summarizeGoals(goals) {
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const autoSaveCount = goals.filter((goal) => goal.autoSave).length;
  const completionPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return {
    totalTarget: toRounded(totalTarget, 2),
    totalSaved: toRounded(totalSaved, 2),
    completionPct: toRounded(completionPct, 1),
    autoSaveCount,
  };
}

export function getSavingsOverview(address) {
  const goals = getGoals(address);
  const summary = summarizeGoals(goals);
  return {
    goals,
    summary,
    insight: goals.length
      ? "Posso usar o excedente diário da wallet para acelerar a meta principal sem comprometer sua liquidez."
      : "Crie a primeira meta para o agente começar a reservar parte do capital produtivo da wallet.",
    updatedAt: new Date().toISOString(),
  };
}

export function createGoal(address, payload) {
  const created = addGoal(address, payload);
  return {
    goal: created,
    updatedAt: new Date().toISOString(),
  };
}

export function patchGoal(address, id, patch) {
  const updated = updateGoal(address, id, patch);
  if (!updated) {
    throw new Error("Goal not found.");
  }
  return {
    goal: updated,
    updatedAt: new Date().toISOString(),
  };
}
