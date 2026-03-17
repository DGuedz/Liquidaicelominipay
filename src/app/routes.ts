import { createBrowserRouter } from "react-router";
import type { ComponentType } from "react";
import { RootLayout } from "./components/root-layout";
import { MobileLayout } from "./components/mobile-layout";
import { ErrorPage } from "./pages/error";

type LazyRouteModule = Record<string, unknown>;

function lazyComponent<TModule extends LazyRouteModule>(
  load: () => Promise<TModule>,
  exportName: keyof TModule,
) {
  return async () => {
    const mod = await load();
    const Component = mod[exportName];

    if (typeof Component !== "function") {
      throw new Error(`Route export "${String(exportName)}" is not a valid component.`);
    }

    return { Component: Component as ComponentType };
  };
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    ErrorBoundary: ErrorPage,
    children: [
      {
        index: true,
        lazy: lazyComponent(() => import("./pages/landing"), "LandingPage"),
      },
      {
        path: "minipay",
        lazy: lazyComponent(() => import("./pages/minipay-pitch"), "MiniPayPitchPage"),
      },
      {
        path: "minipay-pitch",
        lazy: lazyComponent(() => import("./pages/minipay-pitch"), "MiniPayPitchPage"),
      },
      {
        path: "brief",
        lazy: lazyComponent(() => import("./pages/project-brief"), "ProjectBriefPage"),
      },

      {
        lazy: lazyComponent(() => import("./components/web3-layout"), "Web3Layout"),
        children: [
          {
            path: "onboarding",
            lazy: lazyComponent(() => import("./pages/onboarding"), "OnboardingPage"),
          },
      
          /* Mobile App Pages - Wrapped in Floating Card Layout on Desktop */
          {
            Component: MobileLayout,
            children: [
              {
                path: "home",
                lazy: lazyComponent(() => import("./pages/home"), "HomePage"),
              },
              {
                path: "dashboard",
                lazy: lazyComponent(() => import("./pages/home"), "HomePage"),
              },
              {
                path: "transfer",
                lazy: lazyComponent(() => import("./pages/transfer"), "TransferPage"),
              },
              {
                path: "receipt",
                lazy: lazyComponent(() => import("./pages/receipt"), "ReceiptPage"),
              },
              {
                path: "analytics",
                lazy: lazyComponent(() => import("./pages/analytics"), "AnalyticsPage"),
              },
              {
                path: "card",
                lazy: lazyComponent(() => import("./pages/card"), "CardPage"),
              },
              {
                path: "profile",
                lazy: lazyComponent(() => import("./pages/profile"), "ProfilePage"),
              },
              {
                path: "profile/dados",
                lazy: lazyComponent(() => import("./pages/profile-dados"), "ProfileDadosPage"),
              },
              {
                path: "profile/carteiras",
                lazy: lazyComponent(() => import("./pages/profile-carteiras"), "ProfileCarteirasPage"),
              },
              {
                path: "profile/notificacoes",
                lazy: lazyComponent(() => import("./pages/profile-notificacoes"), "ProfileNotificacoesPage"),
              },
              {
                path: "profile/seguranca",
                lazy: lazyComponent(() => import("./pages/profile-seguranca"), "ProfileSegurancaPage"),
              },
              {
                path: "profile/agente-config",
                lazy: lazyComponent(() => import("./pages/profile-agente-config"), "ProfileAgenteConfigPage"),
              },
              {
                path: "profile/relatorios",
                lazy: lazyComponent(() => import("./pages/profile-relatorios"), "ProfileRelatoriosPage"),
              },
              {
                path: "profile/protocolos",
                lazy: lazyComponent(() => import("./pages/profile-protocolos"), "ProfileProtocolosPage"),
              },
              {
                path: "profile/suporte",
                lazy: lazyComponent(() => import("./pages/profile-suporte"), "ProfileSuportePage"),
              },
              {
                path: "profile/sobre",
                lazy: lazyComponent(() => import("./pages/profile-sobre"), "ProfileSobrePage"),
              },
              {
                path: "profile/security",
                lazy: lazyComponent(() => import("./pages/profile/security"), "SecurityPage"),
              },
              {
                path: "profile/protocols",
                lazy: lazyComponent(() => import("./pages/profile/protocols"), "ProtocolsPage"),
              },
              {
                path: "profile/yield",
                lazy: lazyComponent(() => import("./pages/profile/yield"), "YieldStrategyPage"),
              },
              {
                path: "karma",
                lazy: lazyComponent(() => import("./pages/karma-dashboard"), "KarmaDashboardPage"),
              },
              {
                path: "scan",
                lazy: lazyComponent(() => import("./pages/scan"), "ScanPage"),
              },
              {
                path: "agent",
                lazy: lazyComponent(() => import("./pages/agent"), "AgentPage"),
              },
              {
                path: "chat",
                lazy: lazyComponent(() => import("./pages/chat"), "ChatPage"),
              },
              {
                path: "savings",
                lazy: lazyComponent(() => import("./pages/savings"), "SavingsPage"),
              },
            ]
          }
        ],
      }
    ],
  },
]);
