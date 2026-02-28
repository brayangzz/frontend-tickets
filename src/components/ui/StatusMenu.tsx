import React, { useState, useRef, useEffect } from "react";
import { Badge } from "./Badge";

interface StatusOption {
  id: number;
  label: string;
  color: "neutral" | "info" | "success" | "warning" | "danger" | "purple";
}

interface Props {
  currentStatusId: number;
  options: StatusOption[];
  onStatusChange: (newStatusId: number) => void;
  isLoading?: boolean;
}

export const StatusMenu = ({ currentStatusId, options, onStatusChange, isLoading }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentOption = options.find(o => o.id === currentStatusId) || options[0];

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: number) => {
    if (id !== currentStatusId) onStatusChange(id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className={`w-2 h-2 rounded-full bg-${currentOption.color}-500`} />
        <span className="text-sm font-medium text-txt-main">{currentOption.label}</span>
        <span className="material-symbols-rounded text-lg text-txt-muted">expand_more</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-enter">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <div className={`w-1.5 h-8 rounded-full ${option.id === currentStatusId ? `bg-${option.color}-500` : 'bg-transparent'}`} />
              <span className={`text-sm font-medium ${option.id === currentStatusId ? 'text-txt-main' : 'text-txt-muted'}`}>
                {option.label}
              </span>
              {option.id === currentStatusId && <span className="material-symbols-rounded text-primary ml-auto text-lg">check</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};