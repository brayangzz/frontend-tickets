import { cn } from "../../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'orange';
  className?: string;
  // Nueva prop opcional para apagar la animación si quieres
  animate?: boolean; 
}

const variants = {
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  neutral: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20"
};

const dots = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-blue-500",
  neutral: "bg-slate-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500"
};

export const Badge = ({ children, variant = 'neutral', className, animate = true }: BadgeProps) => {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wide", variants[variant], className)}>
      <span className={cn(
          "w-1.5 h-1.5 rounded-full", 
          dots[variant],
          // Solo animamos si NO es neutral (para que lo estático no distraiga)
          animate && variant !== 'neutral' && "animate-pulse" 
      )}></span>
      {children}
    </span>
  );
};