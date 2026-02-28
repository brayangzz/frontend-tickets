import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useTheme } from "../../hooks/useTheme";

const SidebarContent = ({ onClose }: { onClose?: () => void }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // 1. LEER DATOS REALES
  const userString = localStorage.getItem('user');
  const rolesMapString = localStorage.getItem('rolesMap');
  
  const user = userString ? JSON.parse(userString) : {};
  const rolesMap = rolesMapString ? JSON.parse(rolesMapString) : {};

  // 2. MAPEO DE PROPIEDADES
  const userName = user.sUser || "Invitado";
  const userRoleId = Number(user.iIdRol || user.ildRol || user.idRole || 0);

  // 3. LÓGICA DE PERMISOS
  const PRIVILEGED_IDS = [1, 25, 31, 32];
  const isPrivileged = PRIVILEGED_IDS.includes(userRoleId);

  // 4. ROL BONITO
  const displayRole = useMemo(() => {
      const foundName = Object.keys(rolesMap).find(key => rolesMap[key] === userRoleId);
      if (foundName) {
          return foundName.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, l => l.toUpperCase());
      }
      if (isPrivileged) return "Soporte TI";
      return "Colaborador";
  }, [rolesMap, userRoleId, isPrivileged]);


  // Usamos rounded-2xl para curvas suaves, scale para efecto "presión" y transiciones fluidas.
  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "relative flex items-center gap-3.5 px-4 py-3.5 mx-3 rounded-2xl transition-all duration-300 group ease-out",
      isActive
        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02] font-semibold" // Estado Activo: Flota y brilla en azul
        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white hover:scale-[1.01]" // Estado Inactivo: Sutil
    );

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  // --- COMPONENTES DE LINK (Para reusar y ordenar) ---
  
  const LinkTickets = (
    <NavLink to="/tickets" className={navItemClass}>
        {/* El icono rota ligeramente al hacer hover*/}
        <span className="material-symbols-rounded text-[24px] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">confirmation_number</span>
        <span className="text-[15px] tracking-wide">Tickets</span>
        {/* Indicador sutil de flecha que aparece al hover */}
        <span className="material-symbols-rounded text-lg ml-auto opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0 transition-all duration-300">chevron_right</span>
    </NavLink>
  );

  const LinkMisTareas = (
    <NavLink to="/my-tasks" className={navItemClass}>
        <span className="material-symbols-rounded text-[22px] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">task_alt</span>
        <span className="text-[15px] tracking-wide">Mis Tareas</span>
    </NavLink>
  );

  return (
    // FONDO: Glassmorphism sutil (Backdrop Blur)
    <div className="flex flex-col h-full bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800/60 transition-colors duration-500">
      
      {/* HEADER: Logo Real */}
      <div className="h-24 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center group cursor-default">
            {/* LOGO ADAPTATIVO: A color en modo claro, Blanco en modo oscuro */}
            <img 
                src="/logo.png" 
                alt="Logo Compers" 
                className="max-h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-105 dark:brightness-0 dark:invert"
            />
        </div>
        
        {onClose && (
            <button onClick={onClose} className="lg:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                <span className="material-symbols-rounded text-slate-500">close</span>
            </button>
        )}
      </div>

      {/* SEPARADOR SUTIL */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent mx-6 mb-4 opacity-50" />

      {/* MENU SCROLLABLE */}
      <nav className="flex-1 py-2 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar px-1">
        
        {/* Etiqueta de sección sutil */}
        <div className="px-6 py-2">
            <p className="text-[11px] font-bold text-slate-400/80 uppercase tracking-widest">Menu Principal</p>
        </div>
          
        {/* 1. VISIBLE SOLO PARA PRIVILEGIADOS */}
        {isPrivileged && (
        <>
            <NavLink to="/" className={navItemClass}>
                <span className="material-symbols-rounded text-[24px] transition-transform duration-300 group-hover:scale-110">grid_view</span>
                <span className="text-[15px] tracking-wide">Dashboard</span>
            </NavLink>
            
            <NavLink to="/users" className={navItemClass}>
                <span className="material-symbols-rounded text-[24px] transition-transform duration-300 group-hover:scale-110">group</span>
                <span className="text-[15px] tracking-wide">Usuarios</span>
            </NavLink>
        </>
        )}

        {/* 2. ORDENAMIENTO (Tu lógica original) */}
        {!isPrivileged && LinkMisTareas}
        {LinkTickets}
        {isPrivileged && LinkMisTareas}

      </nav>

      {/* FOOTER "ISLA" FLOTANTE */}
      <div className="p-4 shrink-0">
        {/* Tarjeta de Usuario */}
        <div className="bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group">
            
            {/* Perfil */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-white/50 dark:border-white/10 shadow-inner">
                    <span className="text-sm font-bold uppercase">{userName.charAt(0)}</span>
                </div>
                <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate capitalize">{userName}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">{displayRole}</p>
                </div>
            </div>

            {/* Botones de Acción (Iconos limpios) */}
            <div className="flex items-center gap-2">
                <button 
                    onClick={toggleTheme}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-all text-xs font-bold shadow-sm"
                >
                    <span className="material-symbols-rounded text-base">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                    {theme === 'dark' ? 'Claro' : 'Oscuro'}
                </button>
                <button 
                    onClick={handleLogout}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-rose-500/50 text-slate-600 dark:text-slate-400 hover:text-rose-500 transition-all text-xs font-bold shadow-sm group/logout"
                >
                    <span className="material-symbols-rounded text-base group-hover/logout:-translate-x-0.5 transition-transform">logout</span>
                    Salir
                </button>
            </div>
        </div>
        
        {/* Versión sutil */}
        <p className="text-[9px] text-center text-slate-400 dark:text-slate-600 mt-3 font-mono opacity-60">v2.4.0 CompersSys</p>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  return (
    <aside className="hidden lg:flex w-72 flex-col h-screen sticky top-0 z-30">
      <SidebarContent />
    </aside>
  );
};

export const MobileSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    return (
        <>
            <div className={cn("fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-500 backdrop-blur-sm", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={onClose} />
            <div className={cn("fixed inset-y-0 left-0 w-72 z-50 lg:hidden transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) shadow-2xl", isOpen ? "translate-x-0" : "-translate-x-full")}>
                <SidebarContent onClose={onClose} />
            </div>
        </>
    );
};