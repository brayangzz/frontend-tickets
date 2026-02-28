import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
// Servicios
import { getTickets, type Ticket } from "../services/ticketService";
// Roles
import { isSupportUser } from "../config/roles";
import { motion } from "framer-motion";

// Helper para avatar
const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

const getAvatarGradient = (id: number) => {
    const gradients = ['from-blue-500 to-indigo-600', 'from-emerald-400 to-teal-600', 'from-orange-400 to-rose-500', 'from-purple-500 to-fuchsia-600', 'from-cyan-400 to-blue-600'];
    return gradients[id % gradients.length];
};

export const Dashboard = () => {
  const navigate = useNavigate();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- ROL USUARIO ---
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : {};
  const currentRoleId = Number(currentUser.iIdRol || currentUser.ildRol || currentUser.idRole || 0);
  const currentUserId = Number(currentUser.iIdUser || currentUser.ildUser || currentUser.idUser || 0);
  const userName = currentUser.sUser || currentUser.employeeName || "Usuario";
  
  const isSupport = isSupportUser(currentRoleId);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const ticketsData = await getTickets();
        let allTickets = Array.isArray(ticketsData) ? ticketsData : [];

        // --- FILTRADO DE SEGURIDAD ---
        if (!isSupport) {
            allTickets = allTickets.filter(t => t.iIdUserRaisedTask === currentUserId);
        }

        // Ordenar: Más recientes primero
        allTickets.sort((a, b) => new Date(b.dDateUserCreate).getTime() - new Date(a.dDateUserCreate).getTime());

        setTickets(allTickets);
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    loadData();
  }, [currentUserId, isSupport]);

  // KPIs Dinámicos
  const kpis = useMemo(() => ({
      total: tickets.length,
      pending: tickets.filter(t => t.iIdStatus === 1).length,
      inProcess: tickets.filter(t => t.iIdStatus === 2 || t.iIdStatus === 3).length, // Sumamos Abierto y En Proceso
      solved: tickets.filter(t => t.iIdStatus === 5 || t.iIdStatus === 4).length,
  }), [tickets]);

  // --- LIMITAR A PREVIEW (Solo los últimos 5) ---
  const recentTickets = tickets.slice(0, 5);

  const getStatusConfig = (id: number) => {
    const statusObj = { label: "Desconocido", className: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700", dot: "bg-slate-400" };
    switch (id) {
        case 1: return { label: "PENDIENTE", className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50", dot: "bg-amber-500" };
        case 2: return { label: "ABIERTO", className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50", dot: "bg-blue-500" };
        case 3: return { label: "EN PROCESO", className: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50", dot: "bg-indigo-500" };
        case 4: return { label: "COMPLETADO", className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50", dot: "bg-emerald-500" };
        case 5: return { label: "SOLUCIONADO", className: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/50", dot: "bg-teal-500" };
        case 6: return { label: "CANCELADO", className: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50", dot: "bg-rose-500" };
        default: return statusObj;
    }
  };

  // Formato: 24 feb, 09:48 a. m.
  const formatDateTime = (dateStr: string) => {
      const d = new Date(dateStr);
      const day = d.getDate();
      const month = d.toLocaleDateString("es-MX", { month: 'short' });
      let hours = d.getHours();
      const mins = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
      hours = hours % 12;
      hours = hours ? hours : 12; 
      return `${day} ${month}, ${hours.toString().padStart(2, '0')}:${mins} ${ampm}`;
  };

  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Buenos días";
      if (hour < 18) return "Buenas tardes";
      return "Buenas noches";
  };

  return (
    <div className="flex flex-col gap-10 w-full max-w-[1600px] mx-auto pb-12 font-display text-txt-main">
      
      {/* HEADER HERO (Entrada rápida) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3, ease: "easeOut" }} 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                {getGreeting()}, <span className="text-blue-500">{userName.split(' ')[0]}</span>.
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">
                {isSupport ? "Aquí está el resumen global de los tickets del sistema." : "Aquí tienes el estado de tus solicitudes recientes."}
            </p>
        </div>
      </motion.div>

      {/* KPIS WIDGETS REDISEÑADOS (Animación en cascada rápida) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <WidgetKPI title="TOTAL TICKETS" value={kpis.total} icon="inbox" color="text-slate-500 dark:text-slate-400" numColor="text-slate-900 dark:text-white" bg="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800" delay={0} />
         <WidgetKPI title="PENDIENTES" value={kpis.pending} icon="pending_actions" color="text-amber-500" numColor="text-amber-500" bg="bg-white dark:bg-[#1e293b] border-amber-200 dark:border-amber-900/50" delay={0.05} />
         <WidgetKPI title="EN PROCESO" value={kpis.inProcess} icon="sync" color="text-blue-500" numColor="text-blue-500" bg="bg-white dark:bg-[#1e293b] border-blue-200 dark:border-blue-900/50" delay={0.1} />
         <WidgetKPI title="RESUELTOS" value={kpis.solved} icon="check_circle" color="text-emerald-500" numColor="text-emerald-500" bg="bg-white dark:bg-[#1e293b] border-emerald-200 dark:border-emerald-900/50" delay={0.15} />
      </div>

      {/* SECCIÓN RECIENTES (Entrada rápida acompañando a los KPIs) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }} 
        className="flex flex-col gap-6 mt-2"
      >
          {/* HEADER DE LA TABLA */}
          <div className="flex justify-between items-center px-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                      <span className="material-symbols-rounded">history</span> 
                  </div>
                  Actividad Reciente
              </h2>
              
              <motion.button 
                whileHover={{ x: 5 }}
                onClick={() => navigate('/tickets')}
                className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors flex items-center gap-1.5 px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
              >
                  Ver todos <span className="material-symbols-rounded text-lg">arrow_forward</span>
              </motion.button>
          </div>

          <Card className="flex flex-col shadow-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-[24px] overflow-hidden p-0">
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[10px] uppercase tracking-widest text-slate-500 font-extrabold bg-slate-50/50 dark:bg-[#0f172a]/30">
                              <th className="px-8 py-5">#ID</th>
                              <th className="px-6 py-5 w-1/3">ASUNTO / DESCRIPCIÓN</th>
                              <th className="px-6 py-5">TIPO</th>
                              <th className="px-6 py-5">ESTADO</th>
                              <th className="px-6 py-5">CREADO POR</th> 
                              <th className="px-6 py-5 text-right">FECHA</th>
                          </tr>
                      </thead>
                      <tbody className="text-sm bg-white dark:bg-[#1e293b]">
                          {isLoading ? (
                              [...Array(5)].map((_, i) => (
                                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50">
                                      <td className="px-8 py-5"><Skeleton className="h-4 w-8 rounded" /></td>
                                      <td className="px-6 py-5"><Skeleton className="h-4 w-48 rounded" /></td>
                                      <td className="px-6 py-5"><Skeleton className="h-6 w-24 rounded-md" /></td>
                                      <td className="px-6 py-5"><Skeleton className="h-6 w-20 rounded-full" /></td>
                                      <td className="px-6 py-5"><Skeleton className="h-8 w-8 rounded-full" /></td>
                                      <td className="px-6 py-5"><Skeleton className="h-4 w-24 rounded ml-auto" /></td>
                                  </tr>
                              ))
                          ) : recentTickets.length === 0 ? (
                              <tr>
                                  <td colSpan={6} className="px-6 py-24 text-center">
                                      <div className="flex flex-col items-center gap-4 opacity-50">
                                          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                                              <span className="material-symbols-rounded text-4xl">inventory_2</span>
                                          </div>
                                          <p className="font-medium text-slate-500">Todo está tranquilo por aquí.</p>
                                      </div>
                                  </td>
                              </tr>
                          ) : (
                              recentTickets.map((t, index) => {
                                  const status = getStatusConfig(t.iIdStatus);
                                  const taskName = (t as any).sName;

                                  return (
                                      <tr 
                                        key={t.iIdTask} 
                                        onClick={() => navigate(`/tickets/${t.iIdTask}`)} 
                                        className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-300 border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                                      >
                                          <td className="px-8 py-6">
                                              <span className="font-mono font-extrabold text-[12px] text-slate-400 group-hover:text-blue-500 transition-colors">#{t.iIdTask}</span>
                                          </td>
                                          
                                          {/* COLUMNA DE TÍTULO Y DESCRIPCIÓN ESTILO PREMIUM */}
                                          <td className="px-6 py-6">
                                            <div className="flex flex-col justify-center gap-1">
                                                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 truncate max-w-[400px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {taskName || t.sDescription}
                                                </span>
                                                {taskName && (
                                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold truncate max-w-[400px] tracking-wide">
                                                        {t.sDescription}
                                                    </span>
                                                )}
                                            </div>
                                          </td>

                                          <td className="px-6 py-6">
                                              <span className="inline-flex text-[10px] font-extrabold uppercase tracking-widest text-slate-500 bg-transparent border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-sm">
                                                  {t.taskTypeName || "TICKET"}
                                              </span>
                                          </td>
                                          
                                          <td className="px-6 py-6">
                                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${status.className} shadow-sm`}>
                                                  <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></div>
                                                  <span className="text-[10px] font-extrabold uppercase tracking-widest">{status.label}</span>
                                              </div>
                                          </td>

                                          {/* CREADO POR */}
                                          <td className="px-6 py-6">
                                              <div className="flex items-center gap-3">
                                                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient(t.iIdTask)} text-white flex items-center justify-center text-[10px] font-bold shadow-sm`}>
                                                      {getInitials(t.userRaisedName || "Us")}
                                                  </div>
                                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                      {t.userRaisedName || "Desconocido"}
                                                  </span>
                                              </div>
                                          </td>

                                          <td className="px-6 py-6 text-right">
                                              <div className="flex items-center justify-end gap-1 text-slate-500 dark:text-slate-400">
                                                  <span className="text-[11px] font-medium tracking-wide">{formatDateTime(t.dDateUserCreate)}</span>
                                              </div>
                                          </td>
                                      </tr>
                                  );
                              })
                          )}
                      </tbody>
                  </table>
              </div>
          </Card>
      </motion.div>
    </div>
  );
};

// COMPONENTE WIDGET KPI (Animaciones y tiempos optimizados para que sea "snappy")
const WidgetKPI = ({ title, value, icon, color, numColor, bg, delay }: { title: string, value: number, icon: string, color: string, numColor: string, bg: string, delay: number }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, delay: delay, ease: "easeOut" }} 
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className={`relative p-6 md:p-7 rounded-[24px] border ${bg} shadow-md transition-shadow duration-300 group overflow-hidden flex flex-col justify-between h-[140px] md:h-[150px]`}
    >
        <div className="flex justify-between items-start relative z-10">
            <span className="text-[11px] md:text-xs uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400">{title}</span>
            <span className={`material-symbols-rounded text-xl md:text-2xl ${color} opacity-80 group-hover:opacity-100 transition-opacity`}>{icon}</span>
        </div>
        <h3 className={`text-4xl md:text-5xl font-black ${numColor} relative z-10 drop-shadow-sm tracking-tighter leading-none`}>
            {value.toString().padStart(2, '0')}
        </h3>
        
        {/* Icono de fondo gigante y sutil */}
        <div className={`absolute -right-6 -bottom-6 opacity-[0.02] dark:opacity-[0.04] group-hover:opacity-[0.06] transition-all transform group-hover:scale-110 duration-500 group-hover:-rotate-6`}>
            <span className="material-symbols-rounded text-[140px] md:text-[150px]">{icon}</span>
        </div>
    </motion.div>
);