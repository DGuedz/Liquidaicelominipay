import { useNavigate, useLocation } from "react-router";
import { Download, Share2, Check, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function ReceiptPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [confettiDone, setConfettiDone] = useState(false);

  const { amount, recipient, recipientAccount } = location.state || {
    amount: 1000.0,
    recipient: "Maria Silva",
    recipientAccount: "4323 7453 6932",
  };

  const refNumber = `LQ${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const now = new Date();
  const date = now.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    const timer = setTimeout(() => setConfettiDone(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const details = [
    { label: "Valor", value: `$${amount.toFixed(2)}`, mono: true, highlight: true },
    { label: "Para", value: recipient, mono: false },
    { label: "Conta", value: recipientAccount, mono: true },
    { label: "Status", value: "Sucesso", mono: false, success: true },
    { label: "Ref. nº", value: refNumber, mono: true },
    { label: "Método", value: "LiquidAI Transfer", mono: false },
    { label: "Data", value: date, mono: true },
    { label: "Hora", value: time, mono: true },
  ];

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 pt-14 pb-4 flex items-center relative">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full bg-surface-solid flex items-center justify-center absolute left-5"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <span className="font-semibold text-text-primary mx-auto">
          Comprovante
        </span>
      </header>

      <div className="flex-1 px-5 flex flex-col">
        {/* Success Animation */}
        <div className="flex flex-col items-center mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.1,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="relative mb-4"
          >
            {/* Outer ring */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute inset-0 rounded-full"
              style={{
                background: "rgba(163,217,119,0.2)",
                transform: "scale(1.3)",
              }}
            />
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
                boxShadow: "0 8px 32px rgba(13,75,46,0.3)",
              }}
            >
              <Check
                className="w-12 h-12 text-white"
                strokeWidth={2.5}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-center"
          >
            <p className="font-bold text-text-primary text-xl mb-1">
              Transferência Concluída!
            </p>
            <p className="text-text-muted text-sm">
              Enviado com sucesso para {recipient}
            </p>
          </motion.div>
        </div>

        {/* Amount Highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-5"
        >
          <span
            className="font-mono font-bold"
            style={{ fontSize: "clamp(2rem, 10vw, 3rem)", color: "#0D4B2E", lineHeight: 1 }}
          >
            ${amount.toFixed(2)}
          </span>
        </motion.div>

        {/* Receipt Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-surface-solid rounded-3xl mb-5 overflow-hidden"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
        >
          {/* Ticket tear line */}
          <div className="relative h-6 flex items-center">
            <div className="absolute -left-3 w-6 h-6 rounded-full bg-background" />
            <div
              className="flex-1 mx-3 border-t-2 border-dashed"
              style={{ borderColor: "#E5E7EB" }}
            />
            <div className="absolute -right-3 w-6 h-6 rounded-full bg-background" />
          </div>

          <div className="px-5 pb-5 space-y-4">
            {details.map((d, i) => (
              <motion.div
                key={d.label}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.04 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">{d.label}</span>
                  <span
                    className={[
                      "text-right font-medium",
                      d.mono ? "font-mono" : "",
                      d.highlight ? "text-xl font-bold text-text-primary" : "",
                      d.success ? "text-success font-semibold" : "",
                      !d.highlight && !d.success ? "text-text-primary" : "",
                    ].join(" ")}
                  >
                    {d.value}
                  </span>
                </div>
                {i < details.length - 1 && (
                  <div
                    className="h-px mt-3"
                    style={{ background: "#F3F4F6" }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* LiquidAI Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background: "#0D4B2E" }}
          >
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
          <span className="text-xs text-text-muted">
            Verificado por LiquidAI · Blockchain secured
          </span>
        </motion.div>

        {/* Action Buttons */}
        <div className="space-y-3 pb-10">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-full py-4 font-semibold flex items-center justify-center gap-2"
            style={{ background: "var(--card-bg)", color: "#0D4B2E" }}
          >
            <Share2 className="w-5 h-5" />
            Compartilhar Comprovante
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-full py-4 font-semibold flex items-center justify-center gap-2"
            style={{ background: "var(--muted)", color: "var(--text-secondary)" }}
          >
            <Download className="w-5 h-5" />
            Baixar PDF
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/")}
            className="w-full rounded-full py-4 font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
              boxShadow: "0 4px 20px rgba(13,75,46,0.25)",
            }}
          >
            Voltar ao Início
          </motion.button>
        </div>
      </div>
    </div>
  );
}