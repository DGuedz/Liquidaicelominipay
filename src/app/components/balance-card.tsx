import { useState } from "react";
import { Eye, EyeOff, Grid3x3 } from "lucide-react";
import { motion } from "motion/react";

interface BalanceCardProps {
  balance: number;
  accountNumber: string;
  expiryDate: string;
  onToggleVisibility?: (visible: boolean) => void;
}

export function BalanceCard({ 
  balance, 
  accountNumber, 
  expiryDate,
  onToggleVisibility 
}: BalanceCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleToggle = () => {
    const newState = !isVisible;
    setIsVisible(newState);
    onToggleVisibility?.(newState);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-card-bg relative overflow-hidden"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Your Balance</span>
            <button onClick={handleToggle}>
              {isVisible ? (
                <Eye className="w-4 h-4 text-text-muted" />
              ) : (
                <EyeOff className="w-4 h-4 text-text-muted" />
              )}
            </button>
          </div>
          <button className="w-8 h-8 flex items-center justify-center">
            <Grid3x3 className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="mb-6">
          <div className="text-balance text-4xl text-text-primary">
            {isVisible 
              ? `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '••••••'}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-text-muted mb-1">Account Number</div>
            <div className="mono-numeric text-sm text-text-primary">{accountNumber}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-text-muted mb-1">Expired Date</div>
            <div className="mono-numeric text-sm text-text-primary">{expiryDate}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
