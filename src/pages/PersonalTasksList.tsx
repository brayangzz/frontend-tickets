import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";

// IMPORTAMOS SERVICIOS
import { getPersonalTasks, deletePersonalTask, type PersonalTask } from "../services/taskService";
import { getTaskTypes, getStatuses, type TaskType, type Status } from "../services/catalogService";

export const PersonalTasksList = () => {
  const navigate = useNavigate();
  
  // --- ESTADOS DE DATOS ---
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- ESTADOS DE FILTROS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateOrder, setDateOrder] = useState("desc");

  // CARGAR DATOS
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [tasksData, typesData, statusData] = await Promise.all([
          getPersonalTasks(),
          getTaskTypes(),
          getStatuses()
        ]);

        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setTaskTypes(Array.isArray(typesData) ? typesData : []);
        setStatuses(Array.isArray(statusData) ? statusData : []); 

      } catch (error) {
        console.error("Error cargando lista de tareas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // --- LÓGICA DE ELIMINAR ---
  const handleDelete = async (e: React.MouseEvent, id: number) => {
      e.stopPropagation(); // Evita navegar al detalle
      
      if (!window.confirm("¿Estás seguro de eliminar esta tarea?")) return;

      const success = await deletePersonalTask(id);
      if (success) {
          setTasks(prev => prev.filter(t => t.iIdTask !== id));
      } else {
          alert("No se pudo eliminar la tarea");
      }
  };

  // --- HELPERS ---
  const formatApiDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-MX", { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getTaskTypeName = (id: number) => {
    const type = taskTypes.find(t => t.iIdTaskType === id);
    return type ? type.sTaskType : "General";
  };

  const getStatusInfo = (id: number) => {
    const statusObj = statuses.find(s => s.iIdStatus === id);                                                                                                                                                                                                                                                                                                                                                                
    const label = statusObj ? statusObj.sStatus.toUpperCase() : "DESCONOCIDO";

    let variant = 'neutral';
    let className = "";

    switch (id) {
        case 1: className = "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"; variant = "warning"; break;
        case 2: className = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"; variant = "info"; break;
        case 3: className = "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800"; variant = "info"; break;
        case 4: className = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"; variant = "success"; break;
        case 5: className = "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800"; variant = "success"; break;
        case 6: className = "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800"; variant = "danger"; break;
        default: className = "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"; variant = "neutral";
    }
    return { label, className, variant };
  };

  // --- FILTRADO Y ORDENAMIENTO ---
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
        const typeName = getTaskTypeName(task.iIdTaskType).toLowerCase();
        const description = task.sDescription?.toLowerCase() || "";
        // Usamos as any por si sName aún no está en la interfaz PersonalTask
        const title = (task as any).sName?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();
        
        // Ahora busca por título, descripción, tipo o ID de tarea
        const matchesSearch = description.includes(search) || typeName.includes(search) || title.includes(search) || task.iIdTask.toString().includes(search);
        const matchesStatus = statusFilter === "all" || task.iIdStatus === Number(statusFilter);

        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        const dateA = new Date(a.dDateUserCreate).getTime();
        const dateB = new Date(b.dDateUserCreate).getTime();
        return dateOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [tasks, searchTerm, statusFilter, dateOrder, taskTypes]);

  const handleReset = () => {
      setSearchTerm("");
      setStatusFilter("all");
      setDateOrder("desc");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto pb-12 font-display text-txt-main"
    >
      
      {/* HEADER */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm group"
            >
              <span className="material-symbols-rounded text-2xl group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            </motion.button>

            <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/my-tasks/new')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all"
            >
                <span className="material-symbols-rounded text-xl">add</span> Nueva Tarea
            </motion.button>
        </div>

        <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Mis Tareas Personales</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Administra tus pendientes privados y recordatorios.</p>
        </div>
      </div>

      {/* CARD PRINCIPAL */}
      <Card className="flex flex-col shadow-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 p-0 overflow-hidden rounded-[30px]">
          
          {/* BARRA DE FILTROS */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
              
              {/* Buscador */}
              <div className="w-full xl:w-1/3 relative group">
                  <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors text-xl">search</span>
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por Título, Descripción o ID..." 
                    className="w-full pl-12 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                  />
                  {searchTerm && (
                      <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors">
                          <span className="material-symbols-rounded text-lg">close</span>
                      </button>
                  )}
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-end items-center">
                  
                  {/* Select Estatus */}
                  <div className="relative group">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none cursor-pointer transition-all min-w-[180px] font-medium"
                        >
                            <option value="all">Estatus: Todos</option>
                            {statuses.map(st => (
                                <option key={st.iIdStatus} value={st.iIdStatus}>{st.sStatus}</option>
                            ))}
                        </select>
                        <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:rotate-180 transition-transform duration-300">expand_more</span>
                  </div>

                  {/* Select Orden */}
                  <div className="relative group">
                        <select 
                            value={dateOrder}
                            onChange={(e) => setDateOrder(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none cursor-pointer transition-all font-medium"
                        >
                            <option value="desc">Más recientes</option>
                            <option value="asc">Más antiguas</option>
                        </select>
                        <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:rotate-180 transition-transform duration-300">sort</span>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="flex items-center justify-center w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-500 hover:border-blue-200 transition-colors group"
                    title="Limpiar filtros"
                  >
                      <span className="material-symbols-rounded text-xl group-hover:-rotate-180 transition-transform duration-500">restart_alt</span>
                  </motion.button>
              </div>
          </div>

          {/* TABLA */}
          <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-bold bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-sm sticky top-0 z-10">
                          <th className="px-6 py-5">#ID</th>
                          <th className="px-6 py-5">Título / Descripción</th>
                          <th className="px-6 py-5">Tipo</th>
                          <th className="px-6 py-5">Estatus</th>
                          <th className="px-6 py-5">Fecha Inicio</th>
                          <th className="px-6 py-5 text-right">Acciones</th>
                      </tr>
                  </thead>
                  <tbody className="text-sm bg-white dark:bg-[#1e293b]">
                      {isLoading ? (
                          [...Array(5)].map((_, i) => (
                              <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                                  <td className="px-6 py-5"><Skeleton className="h-4 w-8 rounded bg-slate-200 dark:bg-slate-800" /></td>
                                  <td className="px-6 py-5"><Skeleton className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-800" /></td>
                                  <td className="px-6 py-5"><Skeleton className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                                  <td className="px-6 py-5"><Skeleton className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                                  <td className="px-6 py-5"><Skeleton className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" /></td>
                                  <td className="px-6 py-5"><Skeleton className="h-8 w-16 ml-auto rounded bg-slate-200 dark:bg-slate-800" /></td>
                              </tr>
                          ))
                      ) : filteredTasks.length === 0 ? (
                          <tr>
                              <td colSpan={6} className="px-6 py-20 text-center">
                                  <div className="flex flex-col items-center gap-4">
                                      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                          <span className="material-symbols-rounded text-3xl text-slate-300 dark:text-slate-600">search_off</span>
                                      </div>
                                      <div>
                                        <p className="text-base font-bold text-slate-700 dark:text-white">No se encontraron tareas</p>
                                        <p className="text-sm text-slate-400">Intenta ajustar los filtros de búsqueda.</p>
                                      </div>
                                      <button onClick={handleReset} className="text-blue-500 font-bold text-sm hover:underline">Limpiar filtros</button>
                                  </div>
                              </td>
                          </tr>
                      ) : (
                          filteredTasks.map((task) => {
                              const config = getStatusInfo(task.iIdStatus);
                              const typeName = getTaskTypeName(task.iIdTaskType);
                              // Accedemos al sName dinámicamente
                              const taskName = (task as any).sName;

                              return (
                                <tr 
                                  key={task.iIdTask} 
                                  onClick={() => navigate(`/my-tasks/${task.iIdTask}`)}
                                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 group cursor-pointer"
                                >
                                      <td className="px-6 py-5 text-slate-400 font-bold text-xs group-hover:text-blue-500 transition-colors">#{task.iIdTask}</td>
                                      
                                      {/* AÑADIDO: Renderizado de Título (sName) y Descripción en formato elegante */}
                                      <td className="px-6 py-5">
                                          <p className="font-bold text-slate-800 dark:text-white truncate max-w-[300px]">{taskName || task.sDescription}</p>
                                          {taskName && <p className="text-xs text-slate-500 mt-1 truncate max-w-[300px]">{task.sDescription}</p>}
                                      </td>

                                      <td className="px-6 py-5">
                                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                                              {typeName}
                                          </span>
                                      </td>
                                      <td className="px-6 py-5">
                                          <Badge variant={config.variant as any} className={`${config.className} uppercase text-[10px] tracking-wide font-bold`}>
                                              {config.label}
                                          </Badge>
                                      </td>
                                      <td className="px-6 py-5 text-slate-500 text-xs font-mono">{formatApiDate(task.dTaskStartDate)}</td>
                                      
                                      <td className="px-6 py-5 text-right">
                                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                              <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-500 transition-colors" title="Ver detalle">
                                                  <span className="material-symbols-rounded text-lg">visibility</span>
                                              </button>
                                              <button 
                                                  onClick={(e) => handleDelete(e, task.iIdTask)}
                                                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-colors"
                                                  title="Eliminar tarea"
                                              >
                                                  <span className="material-symbols-rounded text-lg">delete</span>
                                              </button>
                                          </div>
                                      </td>
                                </tr>
                              );
                          })
                      )}
                  </tbody>
              </table>
          </div>
          
          {/* PAGINACIÓN VISUAL */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1e293b] rounded-b-[30px] flex justify-between items-center">
               <span className="text-xs font-medium text-slate-400">Mostrando {filteredTasks.length} de {tasks.length} registros</span>
               <div className="flex gap-2">
                   <button disabled className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 disabled:opacity-30 transition-all">
                       <span className="material-symbols-rounded text-lg">chevron_left</span>
                   </button>
                   <button disabled className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 disabled:opacity-30 transition-all">
                       <span className="material-symbols-rounded text-lg">chevron_right</span>
                   </button>
               </div>
          </div>
      </Card>
    </motion.div>
  );
};