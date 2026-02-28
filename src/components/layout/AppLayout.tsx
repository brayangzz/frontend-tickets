import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, MobileSidebar } from "./Sidebar"; // Importamos ambos

export const AppLayout = () => {
  // Estado para controlar si el menú móvil está abierto
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
      
      {/* 1. Sidebar de Escritorio (Visible solo en PC) */}
      <Sidebar />

      {/* 2. Sidebar Móvil (Visible solo cuando se abre en cel) */}
      <MobileSidebar 
         isOpen={isMobileMenuOpen} 
         onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* 3. Contenido Principal */}
      <main className="flex-1 flex flex-col w-full min-w-0">
         
         {/* HEADER MÓVIL (Solo visible en celular para abrir menú) */}
         <div className="lg:hidden p-4 flex items-center justify-between bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                    <span className="material-symbols-rounded text-white text-[20px]">dns</span>
                 </div>
                 <h1 className="text-lg font-bold text-slate-800 dark:text-white">CompersSys</h1>
             </div>
             
             {/* BOTÓN HAMBURGUESA */}
             <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
             >
                 <span className="material-symbols-rounded text-2xl">menu</span>
             </button>
         </div>

         {/* Contenido de las páginas */}
         <div className="p-4 md:p-8 overflow-x-hidden">
            <Outlet />
         </div>

      </main>
    </div>
  );
};