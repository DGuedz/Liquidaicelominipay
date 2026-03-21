import * as React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
}

export const Card = ({ children, interactive = false, className = "", ...props }: CardProps) => {
  return (
    <div
      className={`
        bg-surface border border-border-subtle rounded-xl p-4
        ${interactive ? "hover:border-cyan transition-colors cursor-pointer" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
