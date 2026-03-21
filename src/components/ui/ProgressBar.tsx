import * as React from "react";

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  className?: string;
}

export const ProgressBar = ({ progress, label, className = "" }: ProgressBarProps) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-text-secondary">{label}</span>
          <span className="text-emerald font-mono">{progress}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border-subtle">
        <div
          className="h-full bg-emerald transition-all duration-500 ease-out"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
    </div>
  );
};
