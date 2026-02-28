import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { getStatuses, type Status } from "../services/catalogService";

interface ApiAssignedTask {
    iIdTask: number;
    sName?: string; 
    iIdTaskType: number;
    iIdStatus: number;
    taskTypeName: string;
    statusName: string;
    userCreateName: string;
    sDescription: string;
    dTaskStartDate: string | null;
    dDateUserCreate: string | null;
}

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

export const AssignedTasksList = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<ApiAssignedTask[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { "Authorization": `Bearer ${token}` };

        const [tasksRes, statusData] = await Promise.all([
            fetch("https://tickets-backend-api-gxbkf5enbafxcvb2.francecentral-01.azurewebsites.net/api/tasks/assigned/assigned-to-me", { headers }),
            getStatuses()
        ]);

        if (tasksRes.ok) {
            const data = await tasksRes.json();
            setTasks(data.reverse()); 
        }
        setStatuses(Array.isArray(statusData) ? statusData : []);
      } catch (error) {
        console.error("Error cargando tareas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Lógica de filtrado en tiempo real mejorada
  const filteredTasks = useMemo(() => {
      return tasks.filter(task => {
          const searchLower = searchTerm.toLowerCase();
          const taskTitle = task.sName?.toLowerCase() || "";
          const taskDesc = task.sDescription?.toLowerCase() || "";
          const taskType = task.taskTypeName?.toLowerCase() || "";
          const creator = task.userCreateName?.toLowerCase() || "";
          
          const matchesSearch = 
            taskTitle.includes(searchLower) || 
            taskDesc.includes(searchLower) || 
            taskType.includes(searchLower) || 
            creator.includes(searchLower) ||
            task.iIdTask.toString().includes(searchLower);
          
          const statusText = statuses.find(s => s.iIdStatus === task.iIdStatus)?.sStatus || "Desconocido";
          const matchesStatus = selectedStatus === "Todos" || statusText === selectedStatus;

          return matchesSearch && matchesStatus;
      });
  }, [tasks, searchTerm, selectedStatus, statuses]);

  // Paginación
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage) || 1;
  const currentTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedStatus]);

  const getStatusConfig = (id: number) => {
    const statusObj = statuses.find(s => s.iIdStatus === id);
    const label = statusObj ? statusObj.sStatus.toUpperCase() : "DESCONOCIDO";
    let className = ""; let variant = "neutral";
    switch (id) {
        case 1: className = "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"; variant = "warning"; break;
        case 2: className = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"; variant = "info"; break;
        case 3: className = "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800"; variant = "info"; break;
        case 4: className = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"; variant = "success"; break;
        case 5: className = "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800"; variant = "success"; break;
        case 6: className = "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800"; variant = "danger"; break;
        default: className = "bg-slate-100 text-slate-600 border-slate-200";
    }
    return { label, className, variant: variant as any };
  };

  const formatApiDate = (d: string | null) => d ? new Date(d).toLocaleDateString("es-MX") : "-";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto pb-12 font-display text-slate-900 dark:text-white">
      
      {/* HEADER */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm group">
              <span className="material-symbols-rounded text-2xl group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/my-tasks/new')} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all">
                <span className="material-symbols-rounded text-xl">add_task</span> Nueva Tarea
            </motion.button>
        </div>
        <div>
            <h1 className="text-4xl font-bold tracking-tight">Tareas Asignadas a Mí</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Responsabilidades que otros te han delegado.</p>
        </div>
      </div>

      <Card className="flex flex-col shadow-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 p-0 overflow-hidden rounded-[30px]">
          
          {/* BARRA DE FILTROS */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
              <div className="w-full xl:w-96 relative group">
                  <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors text-xl">search</span>
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por título, descripción o ID..." className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-end items-center">
                  <div className="relative group">
                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="appearance-none pl-4 pr-10 py-3 bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50 outline-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer min-w-[160px]">
                        <option value="Todos">Estatus: Todos</option>
                        {statuses.map(s => <option key={s.iIdStatus} value={s.sStatus}>{s.sStatus}</option>)}
                    </select>
                    <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">filter_list</span>
                  </div>
                  <motion.button onClick={() => { setSearchTerm(""); setSelectedStatus("Todos"); }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-11 h-11 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 transition-colors" title="Reiniciar filtros">
                      <span className="material-symbols-rounded text-xl">restart_alt</span>
                  </motion.button>
              </div>
          </div>

          {/* TABLA */}
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-bold bg-slate-50/50 dark:bg-slate-900/30">
                          <th className="px-8 py-5">#ID</th>
                          <th className="px-6 py-5">Título / Descripción</th>
                          <th className="px-6 py-5">Tipo</th>
                          <th className="px-6 py-5">Estatus</th>
                          <th className="px-6 py-5">Fecha</th>
                          <th className="px-6 py-5">Asignado por</th>
                      </tr>
                  </thead>
                  <tbody className="text-sm">
                      {isLoading ? (
                          [...Array(5)].map((_, i) => (
                              <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50">
                                  <td className="px-8 py-5"><Skeleton className="h-4 w-8 rounded" /></td>
                                  <td className="px-6 py-5"><Skeleton className="h-4 w-48 rounded" /></td>
                                  <td className="px-6 py-5"><Skeleton className="h-6 w-24 rounded-md" /></td>
                                  <td className="px-6 py-5"><Skeleton className="h-6 w-20 rounded-full" /></td>
                                  <td className="px-6 py-5"><Skeleton className="h-4 w-24 rounded" /></td>
                                  <td className="px-6 py-5"><Skeleton className="h-8 w-8 rounded-full" /></td>
                              </tr>
                          ))
                      ) : currentTasks.length === 0 ? (
                          <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-500"><span className="material-symbols-rounded text-5xl opacity-50 mb-2 block">inbox</span>No se encontraron tareas con estos filtros.</td></tr>
                      ) : (
                          currentTasks.map((task) => {
                              const config = getStatusConfig(task.iIdStatus);
                              return (
                                <tr key={task.iIdTask} onClick={() => navigate(`/my-tasks/${task.iIdTask}`)} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0 group cursor-pointer">
                                    <td className="px-8 py-5 text-slate-500 font-mono text-xs group-hover:text-blue-500 transition-colors">#{task.iIdTask}</td>
                                    
                                    {/* RENDERIZADO MEJORADO CON TÍTULO Y DESCRIPCIÓN CORREGIDO */}
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <p className="font-bold text-slate-800 dark:text-white truncate max-w-[350px]">
                                                {task.sName ? task.sName : <span className="text-slate-400 dark:text-slate-600 font-normal italic text-xs">Sin Título</span>}
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[350px] font-medium uppercase tracking-tight">
                                                {task.sDescription}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700">{task.taskTypeName}</span></td>
                                    <td className="px-6 py-5"><Badge variant={config.variant} className={`${config.className} border uppercase text-[10px] tracking-wide font-bold`}>{config.label}</Badge></td>
                                    <td className="px-6 py-5 text-slate-500 text-xs font-mono">{formatApiDate(task.dDateUserCreate || task.dTaskStartDate)}</td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient(task.iIdTask)} text-white flex items-center justify-center text-[10px] font-bold shadow-sm`}>{getInitials(task.userCreateName)}</div>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 hidden xl:block">{task.userCreateName}</span>
                                        </div>
                                    </td>
                                </tr>
                              );
                          })
                      )}
                  </tbody>
              </table>
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1e293b] rounded-b-[30px] flex justify-between items-center">
               <span className="text-xs font-medium text-slate-500">Página {currentPage} de {totalPages}</span>
               <div className="flex gap-2">
                   <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50">
                       <span className="material-symbols-rounded text-lg">chevron_left</span>
                   </button>
                   <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50">
                       <span className="material-symbols-rounded text-lg">chevron_right</span>
                   </button>
               </div>
          </div>
      </Card>
    </motion.div>
  );
};