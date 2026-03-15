import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router";
import { AlertTriangle, Home } from "lucide-react";

export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  let message = "Ocorreu um erro inesperado.";
  let status = "";

  if (isRouteErrorResponse(error)) {
    status = `${error.status} ${error.statusText}`;
    message = error.data ?? message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "rgba(239,68,68,0.1)" }}
      >
        <AlertTriangle className="w-8 h-8" style={{ color: "#EF4444" }} />
      </div>
      {status && (
        <p className="text-sm font-mono text-text-muted mb-2">{status}</p>
      )}
      <h1 className="font-semibold text-text-primary mb-2">Algo deu errado</h1>
      <p className="text-sm text-text-muted mb-8 max-w-xs">{message}</p>
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-sm font-medium"
        style={{ background: "#0D4B2E" }}
      >
        <Home className="w-4 h-4" />
        Voltar ao Início
      </button>
    </div>
  );
}
