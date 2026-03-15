import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  trend?: "up" | "down";
  iconBgColor?: string;
  iconColor?: string;
  delay?: number;
}

export function StatCard({ 
  icon: Icon, 
  label, 
  value,
  trend = "up",
  iconBgColor = "bg-success/10",
  iconColor = "text-success",
  delay = 0
}: StatCardProps) {
  const formattedValue = value >= 0 
    ? `+$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    : `-$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-surface-solid rounded-2xl p-4"
    >
      <div className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${iconColor} ${trend === 'up' ? 'rotate-180' : ''}`} />
      </div>
      <div className="text-sm text-text-muted mb-1">{label}</div>
      <div className="text-balance text-xl text-text-primary">
        {formattedValue}
      </div>
    </motion.div>
  );
}
