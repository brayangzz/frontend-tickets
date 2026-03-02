import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Helper Global
export const triggerSessionExpired = () => {
  window.dispatchEvent(new Event("session-expired"));
};

export const SessionExpiredModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleSessionExpired = () => setIsOpen(true);
    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, []);

  const handleLoginRedirect = () => {
    setIsOpen(false);
    localStorage.clear(); 
    // Usamos redirección nativa para limpiar toda la memoria caché de React
    window.location.href = "/login"; 
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="session-expired-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          // z-[99999] para que esté por encima de TODO
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
        >
          <motion.div
            key="session-expired-content"
            initial={{ scale: 0.90, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/60 rounded-[32px] shadow-2xl overflow-hidden flex flex-col p-8 text-center"
          >
            <motion.div 
                initial={{ rotate: -15, scale: 0.8 }} 
                animate={{ rotate: 0, scale: 1 }} 
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="w-20 h-20 mx-auto bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-[24px] flex items-center justify-center mb-6 shadow-inner border border-orange-200 dark:border-orange-500/20"
            >
              <span className="material-symbols-rounded text-[40px]">lock_clock</span>
            </motion.div>

            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
              Sesión Caducada
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 px-2">
              Por tu seguridad, hemos cerrado la sesión tras un periodo de inactividad. Por favor, vuelve a ingresar.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLoginRedirect}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[20px] font-bold text-[15px] shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_12px_25px_rgba(37,99,235,0.4)] border border-blue-500/50 transition-all flex items-center justify-center gap-2"
            >
              Iniciar Sesión
              <span className="material-symbols-rounded text-[20px]">login</span>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};