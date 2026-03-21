// src/lib/tokens.ts
export const tokens = {
  colors: {
    background: {
      base: "#050505", // Fundo super escuro
      surface: "rgba(255, 255, 255, 0.03)", // Cards e destaques leves
    },
    border: {
      subtle: "rgba(255, 255, 255, 0.10)", // Bordas translúcidas
    },
    accent: {
      cyan: {
        DEFAULT: "#00c2ff", // Ações primárias e IA
        hover: "#22D3EE",
      },
      emerald: {
        DEFAULT: "#00ffb4", // Sucesso, Yield
        hover: "#10B981",
      },
      danger: {
        DEFAULT: "#EC4899", // Alertas
        hover: "#EF4444",
      },
    },
    text: {
      primary: "#F8FAFC",
      secondary: "#94A3B8",
      mono: "#00c2ff", // Hash e números de destaque
    },
  },
  radii: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "1rem",
    xl: "1.5rem",
  },
  spacing: {
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
    xl: "3rem",
  },
} as const;
