import { useState } from "react";
import { useNavigate } from "react-router";
import { Delete, ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PageHeader } from "../components/page-header";

const contacts = [
  {
    id: 1,
    name: "Maria Silva",
    account: "4323 7453 6932",
    avatar: "https://images.unsplash.com/photo-1639986162505-c9bcccfc9712?w=100&h=100&fit=crop&crop=face",
    initials: "MS",
  },
  {
    id: 2,
    name: "Carlos Lima",
    account: "8821 4432 1029",
    avatar: null,
    initials: "CL",
  },
  {
    id: 3,
    name: "Arnold Smith",
    account: "1234 5678 9012",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    initials: "AS",
  },
  {
    id: 4,
    name: "Julia Costa",
    account: "5643 2211 8870",
    avatar: null,
    initials: "JC",
  },
];

const avatarColors = ["#0D4B2E", "#3B82F6", "#8B5CF6", "#F59E0B"];

export function TransferPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [selectedContact, setSelectedContact] = useState(contacts[0]);
  const [showContacts, setShowContacts] = useState(false);
  const balance = 1240.50;

  const handleNumber = (num: string) => {
    if (amount.length >= 9) return;
    if (num === "." && amount.includes(".")) return;
    if (num === "." && amount === "") {
      setAmount("0.");
      return;
    }
    // Prevent leading zeros
    if (amount === "0" && num !== ".") {
      setAmount(num);
      return;
    }
    setAmount((prev) => prev + num);
  };

  const handleDelete = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const handleTransfer = () => {
    const val = parseFloat(amount);
    if (val > 0 && val <= balance) {
      navigate("/receipt", {
        state: {
          amount: val,
          recipient: selectedContact.name,
          recipientAccount: selectedContact.account,
        },
      });
    }
  };

  const displayAmount = amount || "0";
  const numericAmount = parseFloat(amount) || 0;
  const isValid = numericAmount > 0 && numericAmount <= balance;

  const keypad = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "DEL"],
  ];

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <PageHeader title="Transferir" />

      {/* Recipient Selector */}
      <div className="px-5 mb-6">
        <p className="text-xs text-text-muted mb-3 uppercase tracking-wider font-semibold">
          Enviar para
        </p>

        {/* Contact Row */}
        <div className="flex items-center gap-3 mb-3 overflow-x-auto pb-2 scrollbar-hide">
          {contacts.map((c, i) => (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedContact(c)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div
                className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center relative"
                style={{
                  border:
                    selectedContact.id === c.id
                      ? "2.5px solid #0D4B2E"
                      : "2.5px solid transparent",
                  background: c.avatar ? "transparent" : avatarColors[i % avatarColors.length],
                  boxShadow: selectedContact.id === c.id
                    ? "0 0 0 3px rgba(13,75,46,0.15)"
                    : "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                {c.avatar ? (
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {c.initials}
                  </span>
                )}
                {selectedContact.id === c.id && (
                  <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: "#0D4B2E", border: "2px solid #F5F5F0" }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                )}
              </div>
              <span
                className="text-xs text-center leading-tight max-w-[56px]"
                style={{
                  color: selectedContact.id === c.id ? "#0D4B2E" : "#718096",
                  fontWeight: selectedContact.id === c.id ? 600 : 400,
                }}
              >
                {c.name.split(" ")[0]}
              </span>
            </motion.button>
          ))}

          {/* Search button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "var(--muted)",
                border: "2.5px dashed var(--border)",
              }}
            >
              <Search className="w-5 h-5 text-text-muted" />
            </div>
            <span className="text-xs text-text-muted">Buscar</span>
          </motion.button>
        </div>

        {/* Selected contact detail */}
        <div
          className="bg-surface-solid rounded-2xl px-4 py-3 flex items-center justify-between"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center"
              style={{ background: "#0D4B2E" }}
            >
              {selectedContact.avatar ? (
                <img
                  src={selectedContact.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xs">
                  {selectedContact.initials}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm">
                {selectedContact.name}
              </p>
              <p className="text-xs font-mono text-text-muted">
                {selectedContact.account}
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-text-muted" />
        </div>
      </div>

      {/* Amount Display */}
      <div className="flex-1 flex flex-col items-center px-5">
        <div className="text-center mb-2 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayAmount.length}
              initial={{ scale: 0.96, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center gap-2"
            >
              <span className="text-3xl text-text-muted font-mono">$</span>
              <span
                className="font-mono font-bold text-text-primary"
                style={{
                  fontSize: displayAmount.length > 6 ? "2.5rem" : "3.5rem",
                  lineHeight: 1,
                }}
              >
                {displayAmount}
              </span>
            </motion.div>
          </AnimatePresence>
          <p className="text-sm text-text-muted mt-2">
            Saldo disponível:{" "}
            <span className="font-mono font-medium text-text-primary">
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </p>
          {numericAmount > balance && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-destructive mt-1 font-medium"
            >
              Saldo insuficiente
            </motion.p>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="w-full max-w-xs mt-4">
          {keypad.map((row, ri) => (
            <div key={ri} className="grid grid-cols-3 gap-3 mb-3">
              {row.map((key) => (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.88 }}
                  onClick={() =>
                    key === "DEL" ? handleDelete() : handleNumber(key)
                  }
                  className="h-16 rounded-2xl flex items-center justify-center font-mono"
                  style={{
                    background: key === "DEL" ? "var(--muted)" : "var(--surface-solid)",
                    boxShadow:
                      key === "DEL"
                        ? "none"
                        : "0 2px 8px rgba(0,0,0,0.08)",
                    fontSize: key === "DEL" ? "0.875rem" : "1.5rem",
                    fontWeight: 600,
                    color: key === "DEL" ? "var(--text-secondary)" : "var(--text-primary)",
                  }}
                >
                  {key === "DEL" ? (
                    <Delete className="w-5 h-5 text-text-secondary" />
                  ) : (
                    key
                  )}
                </motion.button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Transfer Button */}
      <div className="px-5 pb-10 pt-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleTransfer}
          disabled={!isValid}
          className="w-full rounded-full py-4 font-semibold text-lg transition-all duration-200"
          style={{
            background: isValid
              ? "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)"
              : "#E5E7EB",
            color: isValid ? "#FFFFFF" : "#9CA3AF",
            boxShadow: isValid ? "0 4px 20px rgba(13,75,46,0.3)" : "none",
          }}
        >
          {isValid
            ? `Enviar $${numericAmount.toFixed(2)}`
            : "Transferir"}
        </motion.button>
      </div>
    </div>
  );
}