import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";
import { ErrorPage } from "./pages/error";
import { LandingPage } from "./pages/landing";
import { HomePage } from "./pages/home";
import { TransferPage } from "./pages/transfer";
import { ReceiptPage } from "./pages/receipt";
import { AnalyticsPage } from "./pages/analytics";
import { CardPage } from "./pages/card";
import { ProfilePage } from "./pages/profile";
import { ScanPage } from "./pages/scan";
import { MiniPayPitchPage } from "./pages/minipay-pitch";
import { AgentPage } from "./pages/agent";
import { OnboardingPage } from "./pages/onboarding";
import { ChatPage } from "./pages/chat";
import { SavingsPage } from "./pages/savings";
import { ProfileDadosPage } from "./pages/profile-dados";
import { ProfileCarteirasPage } from "./pages/profile-carteiras";
import { ProfileNotificacoesPage } from "./pages/profile-notificacoes";
import { ProfileSegurancaPage } from "./pages/profile-seguranca";
import { ProfileAgenteConfigPage } from "./pages/profile-agente-config";
import { ProfileRelatoriosPage } from "./pages/profile-relatorios";
import { ProfileProtocolosPage } from "./pages/profile-protocolos";
import { ProfileSuportePage } from "./pages/profile-suporte";
import { ProfileSobrePage } from "./pages/profile-sobre";
import { KarmaDashboardPage } from "./pages/karma-dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    ErrorBoundary: ErrorPage,
    children: [
      { index: true, Component: HomePage },
      { path: "dashboard", Component: HomePage },
      { path: "landing", Component: LandingPage },
      { path: "onboarding", Component: OnboardingPage },
      { path: "transfer", Component: TransferPage },
      { path: "receipt", Component: ReceiptPage },
      { path: "analytics", Component: AnalyticsPage },
      { path: "card", Component: CardPage },
      { path: "profile", Component: ProfilePage },
      { path: "profile/dados", Component: ProfileDadosPage },
      { path: "profile/carteiras", Component: ProfileCarteirasPage },
      { path: "profile/notificacoes", Component: ProfileNotificacoesPage },
      { path: "profile/seguranca", Component: ProfileSegurancaPage },
      { path: "profile/agente-config", Component: ProfileAgenteConfigPage },
      { path: "profile/relatorios", Component: ProfileRelatoriosPage },
      { path: "profile/protocolos", Component: ProfileProtocolosPage },
      { path: "profile/suporte", Component: ProfileSuportePage },
      { path: "profile/sobre", Component: ProfileSobrePage },
      { path: "karma", Component: KarmaDashboardPage },
      { path: "scan", Component: ScanPage },
      { path: "agent", Component: AgentPage },
      { path: "chat", Component: ChatPage },
      { path: "savings", Component: SavingsPage },
      { path: "minipay-pitch", Component: MiniPayPitchPage },
    ],
  },
]);