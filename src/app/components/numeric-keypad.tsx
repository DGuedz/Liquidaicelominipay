import { Delete } from "lucide-react";
import { motion } from "motion/react";

interface NumericKeypadProps {
  onNumberClick: (num: string) => void;
  onDecimalClick: () => void;
  onDelete: () => void;
}

export function NumericKeypad({ 
  onNumberClick, 
  onDecimalClick, 
  onDelete 
}: NumericKeypadProps) {
  return (
    <div className="w-full max-w-sm grid grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <KeypadButton
          key={num}
          onClick={() => onNumberClick(num.toString())}
        >
          {num}
        </KeypadButton>
      ))}
      
      <KeypadButton onClick={onDecimalClick}>
        .
      </KeypadButton>
      
      <KeypadButton onClick={() => onNumberClick("0")}>
        0
      </KeypadButton>
      
      <KeypadButton onClick={onDelete}>
        <Delete className="w-6 h-6 text-text-secondary" />
      </KeypadButton>
    </div>
  );
}

function KeypadButton({ 
  children, 
  onClick 
}: { 
  children: React.ReactNode; 
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="h-16 flex items-center justify-center text-2xl font-medium text-text-primary rounded-xl hover:bg-surface-solid transition-colors"
    >
      {children}
    </motion.button>
  );
}
