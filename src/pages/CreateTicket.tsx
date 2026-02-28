import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { createTicket, uploadTicketFile } from "../services/ticketService";
import { getBranches, getDepartments, type Branch, type Department } from "../services/catalogService";
import { motion, AnimatePresence } from "framer-motion";

interface FileWithPreview {
  file: File;
  previewUrl: string | null;
  id: string;
}

export const CreateTicket = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<number | string>("");
  const [selectedDept, setSelectedDept] = useState<number | string>("");
  const [fileData, setFileData] = useState<FileWithPreview[]>([]);

  const [branchesList, setBranchesList] = useState<Branch[]>([]);
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("Generar Ticket");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Estados y Refs para los menús desplegables personalizados
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const branchRef = useRef<HTMLDivElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);

  const isValid = title.trim().length > 0 && description.trim().length > 0 && selectedBranch !== "" && selectedDept !== "";

  // Cargar catálogos
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [branchesData, deptsData] = await Promise.all([getBranches(), getDepartments()]);
        setBranchesList(branchesData || []);
        setDepartmentsList(deptsData || []);
      } catch (err) {
        console.error("Error cargando catálogos", err);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadCatalogs();
  }, []);

  // Clic fuera de los selectores para cerrarlos
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (branchRef.current && !branchRef.current.contains(event.target as Node)) setIsBranchOpen(false);
      if (deptRef.current && !deptRef.current.contains(event.target as Node)) setIsDeptOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Limpiar URLs de previsualización
  useEffect(() => {
    return () => {
      fileData.forEach((item) => { if (item.previewUrl) URL.revokeObjectURL(item.previewUrl); });
    };
  }, [fileData]);

  const processFiles = (newFiles: File[]) => {
    const newFileData: FileWithPreview[] = newFiles.map((file) => ({
      file,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      id: crypto.randomUUID(),
    }));
    setFileData((prev) => [...prev, ...newFileData]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) processFiles(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) processFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = (idToRemove: string) => {
    setFileData((prev) => {
      const item = prev.find((i) => i.id === idToRemove);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== idToRemove);
    });
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    if (!title.trim() || !description.trim()) {
      setErrorMessage("El título y la descripción son obligatorios.");
      return;
    }
    if (!selectedBranch || !selectedDept) {
      setErrorMessage("Debes seleccionar tu sucursal y tu departamento.");
      return;
    }

    setIsSubmitting(true);
    setStatusText("Creando ticket...");
    try {
      const payload = {
        sName: title.trim(),
        sDescription: description.trim(),
        iIdTaskType: 17,
        iIdStatus: 1,
        iIdBranch: Number(selectedBranch),
        iIdDepartment: Number(selectedDept),
        dTaskStartDate: new Date().toISOString(),
      };
      const createdTicket = await createTicket(payload);
      if (createdTicket && createdTicket.iIdTask) {
        if (fileData.length > 0) {
          setStatusText(`Subiendo evidencia (0/${fileData.length})...`);
          let uploadedCount = 0;
          await Promise.all(
            fileData.map(async (data) => {
              const result = await uploadTicketFile(createdTicket.iIdTask, data.file);
              if (result) uploadedCount++;
              setStatusText(`Subiendo evidencia (${uploadedCount}/${fileData.length})...`);
              return result;
            })
          );
        }
        setShowSuccess(true);
        setTimeout(() => navigate("/tickets"), 2500);
      } else {
        setErrorMessage("Error: No se pudo crear el ticket en el servidor.");
        setIsSubmitting(false);
        setStatusText("Generar Ticket");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Ocurrió un error inesperado.");
      setIsSubmitting(false);
      setStatusText("Generar Ticket");
    }
  };

  // --- VISTA ÉXITO ---
  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] font-display">
        <div className="relative mb-8">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30 relative z-10"
          >
            <motion.span
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
              className="material-symbols-rounded text-7xl text-white"
            >check</motion.span>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }} animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 bg-emerald-500/20 rounded-full z-0"
          />
        </div>
        <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3 text-center">
          ¡Ticket Creado!
        </motion.h2>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-slate-500 dark:text-slate-400 text-center text-lg">
          Tu solicitud ha sido registrada correctamente.
        </motion.p>
      </div>
    );
  }

  // --- CLASES REUTILIZABLES PARA INPUTS PREMIUM ---
  const inputPremiumClass = "w-full px-5 py-4 bg-[#0f172a] border border-slate-700/80 rounded-2xl text-[15px] text-white focus:bg-[#131c2f] focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 outline-none transition-all hover:border-slate-600 placeholder:text-slate-500 font-medium shadow-inner";

  // --- VISTA FORMULARIO ---
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col gap-8 w-full max-w-[860px] mx-auto pb-12 font-display"
    >
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center gap-5"
      >
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-md"
        >
          <span className="material-symbols-rounded text-[22px]">arrow_back</span>
        </motion.button>
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">Nuevo Ticket</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[15px] mt-1.5 font-medium">Reporta una incidencia al departamento de Sistemas</p>
        </div>
      </motion.div>

      {/* ERROR */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
              <span className="material-symbols-rounded shrink-0">error</span>
              <p className="font-medium text-sm">{errorMessage}</p>
              <button onClick={() => setErrorMessage(null)} className="ml-auto text-rose-400 hover:text-rose-600 transition-colors">
                <span className="material-symbols-rounded text-[18px]">close</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CARD PRINCIPAL */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      >
        <Card className="overflow-hidden shadow-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-[28px] p-0">

          {/* SECCIÓN PRINCIPAL */}
          <div className="p-8 md:p-10 flex flex-col gap-8">

            {/* Título sección */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                <span className="material-symbols-rounded text-2xl">confirmation_number</span>
              </div>
              <div>
                <h2 className="font-extrabold text-slate-800 dark:text-white text-lg tracking-tight">Información del Ticket</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Los campos marcados con <span className="text-rose-500 font-bold">*</span> son obligatorios</p>
              </div>
            </div>

            {/* TÍTULO */}
            <div className="flex flex-col gap-2.5 group">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 group-focus-within:text-blue-500 transition-colors ml-1">
                Asunto / Título del problema <span className="text-rose-500">*</span>
              </label>
              <input
                type="text" value={title} onChange={(e) => { setTitle(e.target.value); setErrorMessage(null); }}
                placeholder="Ej: Falla en conexión a internet, Error en sistema ERP..."
                autoFocus
                className={inputPremiumClass}
              />
            </div>

            {/* DESCRIPCIÓN */}
            <div className="flex flex-col gap-2.5 group">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 group-focus-within:text-blue-500 transition-colors ml-1">
                Detalles del problema <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  rows={5} value={description} onChange={(e) => { setDescription(e.target.value); setErrorMessage(null); }}
                  placeholder="Explica a detalle qué sucede, desde cuándo y en qué equipo o área..."
                  className={`${inputPremiumClass} resize-none pb-8`}
                />
                <div className="absolute bottom-3 right-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-[#1e293b] px-2 py-1 rounded-lg border border-slate-700 pointer-events-none">
                  {description.length}/2000
                </div>
              </div>
            </div>

            {/* SUCURSAL + DEPARTAMENTO (CUSTOM PREMIUM SELECTS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              
              {/* SUCURSAL */}
              <div className="flex flex-col gap-2.5 group">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 group-focus-within:text-blue-500 transition-colors ml-1 flex items-center gap-1.5">
                  <span className="material-symbols-rounded text-[16px] text-blue-500">store</span>
                  Sucursal <span className="text-rose-500">*</span>
                </label>
                <div className="relative" ref={branchRef}>
                  <motion.button
                    type="button"
                    whileHover={!isLoadingData ? { scale: 1.01 } : {}}
                    whileTap={!isLoadingData ? { scale: 0.98 } : {}}
                    onClick={() => !isLoadingData && setIsBranchOpen(!isBranchOpen)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all shadow-inner ${
                      isBranchOpen ? "bg-[#131c2f] border-blue-500 ring-4 ring-blue-500/15" : "bg-[#0f172a] border-slate-700/80 hover:border-slate-600"
                    } ${isLoadingData ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span className={`font-medium text-[15px] truncate ${selectedBranch === "" ? "text-slate-500" : "text-white"}`}>
                      {isLoadingData ? "Cargando..." : selectedBranch === "" ? "Selecciona tu sucursal" : branchesList.find((b) => b.iIdBranch === Number(selectedBranch))?.sBranch}
                    </span>
                    <span className="material-symbols-rounded text-slate-400" style={{ transform: isBranchOpen ? "rotate(180deg)" : "none" }}>expand_more</span>
                  </motion.button>
                  <AnimatePresence>
                    {isBranchOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }}
                        className="absolute left-0 right-0 mt-2 bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-[100] p-2"
                      >
                        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto comments-scroll pr-1">
                          {branchesList.map((b) => (
                            <button
                              type="button"
                              key={b.iIdBranch}
                              onClick={() => { setSelectedBranch(b.iIdBranch); setIsBranchOpen(false); setErrorMessage(null); }}
                              className={`px-4 py-3 rounded-xl text-left text-sm font-bold transition-all ${selectedBranch === b.iIdBranch ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" : "text-slate-300 hover:bg-[#0f172a] border border-transparent"}`}
                            >
                              {b.sBranch}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* DEPARTAMENTO */}
              <div className="flex flex-col gap-2.5 group">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 group-focus-within:text-indigo-500 transition-colors ml-1 flex items-center gap-1.5">
                  <span className="material-symbols-rounded text-[16px] text-indigo-500">domain</span>
                  Departamento <span className="text-rose-500">*</span>
                </label>
                <div className="relative" ref={deptRef}>
                  <motion.button
                    type="button"
                    whileHover={!isLoadingData ? { scale: 1.01 } : {}}
                    whileTap={!isLoadingData ? { scale: 0.98 } : {}}
                    onClick={() => !isLoadingData && setIsDeptOpen(!isDeptOpen)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all shadow-inner ${
                      isDeptOpen ? "bg-[#131c2f] border-indigo-500 ring-4 ring-indigo-500/15" : "bg-[#0f172a] border-slate-700/80 hover:border-slate-600"
                    } ${isLoadingData ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span className={`font-medium text-[15px] truncate ${selectedDept === "" ? "text-slate-500" : "text-white"}`}>
                      {isLoadingData ? "Cargando..." : selectedDept === "" ? "Selecciona tu departamento" : departmentsList.find((d) => d.iIdDepartment === Number(selectedDept))?.sDepartment}
                    </span>
                    <span className="material-symbols-rounded text-slate-400" style={{ transform: isDeptOpen ? "rotate(180deg)" : "none" }}>expand_more</span>
                  </motion.button>
                  <AnimatePresence>
                    {isDeptOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }}
                        className="absolute left-0 right-0 mt-2 bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-[100] p-2"
                      >
                        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto comments-scroll pr-1">
                          {departmentsList.map((d) => (
                            <button
                              type="button"
                              key={d.iIdDepartment}
                              onClick={() => { setSelectedDept(d.iIdDepartment); setIsDeptOpen(false); setErrorMessage(null); }}
                              className={`px-4 py-3 rounded-xl text-left text-sm font-bold transition-all ${selectedDept === d.iIdDepartment ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "text-slate-300 hover:bg-[#0f172a] border border-transparent"}`}
                            >
                              {d.sDepartment}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          </div>

          {/* SECCIÓN ADJUNTOS */}
          <div className="px-8 md:px-10 pb-10 flex flex-col gap-5 border-t border-slate-100 dark:border-slate-800/80 pt-8 bg-slate-50/20 dark:bg-[#1e293b]/50">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-slate-50 dark:bg-[#0f172a] text-slate-500 dark:text-slate-400 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
                <span className="material-symbols-rounded text-2xl">attach_file</span>
              </div>
              <div>
                <h2 className="font-extrabold text-slate-800 dark:text-white text-lg tracking-tight">Evidencia Visual</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Puedes adjuntar capturas de pantalla (JPG, PNG) o documentos (PDF).</p>
              </div>
            </div>

            <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />

            <motion.div
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`w-full border-2 border-dashed rounded-[24px] p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
                isDragging
                  ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
                  : "border-slate-600 bg-[#0f172a]/50 hover:border-blue-400 hover:bg-[#0f172a]"
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 shadow-lg ${
                isDragging
                  ? "bg-blue-500 text-white"
                  : "bg-[#1e293b] text-slate-400 border border-slate-700 group-hover:bg-blue-500/20 group-hover:text-blue-400 group-hover:border-blue-500/30 group-hover:-translate-y-1"
              }`}>
                <span className="material-symbols-rounded text-[28px]">cloud_upload</span>
              </div>
              <p className="text-[15px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-blue-400 transition-colors">
                {isDragging ? "Suelta los archivos aquí..." : "Haz clic para buscar o arrastra tus archivos aquí"}
              </p>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">Límite por archivo: 10MB</p>
            </motion.div>

            <AnimatePresence>
              {fileData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-3 mt-2"
                >
                  {fileData.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="flex items-center gap-3 bg-[#0f172a] border border-slate-700 pl-2 pr-4 py-2 rounded-2xl text-xs font-semibold text-slate-200 shadow-md group"
                    >
                      {item.previewUrl ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-600 shrink-0 bg-black">
                          <img src={item.previewUrl} alt="preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-400 border border-blue-500/20">
                          <span className="material-symbols-rounded text-[20px]">description</span>
                        </div>
                      )}
                      <span className="max-w-[140px] truncate">{item.file.name}</span>
                      <motion.button
                        whileHover={{ scale: 1.2, rotate: 90 }} whileTap={{ scale: 0.8 }}
                        onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                        className="text-slate-500 hover:text-rose-500 transition-colors ml-1 flex items-center justify-center"
                      >
                        <span className="material-symbols-rounded text-[18px]">cancel</span>
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FOOTER ACCIONES */}
          <div className="px-8 py-6 bg-[#0f172a] border-t border-slate-800 flex flex-col-reverse md:flex-row justify-end items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(-1)}
              className="w-full md:w-auto px-8 py-3.5 rounded-full border border-slate-700 text-sm font-bold text-slate-400 hover:bg-[#1e293b] hover:text-white hover:border-slate-600 transition-all"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileHover={!isSubmitting && isValid ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting && isValid ? { scale: 0.98 } : {}}
              onClick={handleSubmit}
              disabled={isSubmitting || isLoadingData || !isValid}
              className={`w-full md:w-auto px-10 py-3.5 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 transition-all ${
                isSubmitting || isLoadingData || !isValid
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] border border-blue-500/50"
              }`}
            >
              {isSubmitting ? (
                <><span className="material-symbols-rounded animate-spin text-[20px]">progress_activity</span><span>{statusText}</span></>
              ) : (
                <><span className="material-symbols-rounded text-[20px]">send</span><span>Generar Ticket</span></>
              )}
            </motion.button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};