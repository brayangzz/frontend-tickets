import { cn } from "../../lib/utils";

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  return (
    <div className={cn("bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden", className)}>
      {children}
    </div>
  );
};