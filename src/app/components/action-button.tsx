import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
}

export function ActionButton({ 
  icon: Icon, 
  label, 
  onClick,
  variant = "primary",
  fullWidth = false
}: ActionButtonProps) {
  const baseClasses = "rounded-full py-3 px-4 flex items-center justify-center gap-2 font-medium";
  const variantClasses = variant === "primary" 
    ? "bg-primary text-text-on-dark" 
    : "bg-secondary text-text-primary";
  const widthClasses = fullWidth ? "w-full" : "flex-1";

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${widthClasses}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </motion.button>
  );
}
