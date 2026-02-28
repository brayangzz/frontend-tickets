import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Login } from "./pages/Login";

// Páginas
import { Dashboard } from "./pages/Dashboard";
import { Users } from "./pages/Users";
import { CreateUser } from "./pages/CreateUser"; // <-- IMPORTACIÓN NUEVA
import { Tickets } from "./pages/Tickets";
import { TicketDetail } from "./pages/TicketDetail";
import { CreateTicket } from "./pages/CreateTicket";
import { UserDashboard } from "./pages/UserDashboard";
import { CreateTask } from "./pages/CreateTask";
import { TaskDetail } from "./pages/TaskDetail";
import { AssignedTasksList } from "./pages/AssignedTasksList";
import { MyAssignedTasksList } from "./pages/MyAssignedTasksList";
import { PersonalTasksList } from "./pages/PersonalTasksList";

// Seguridad
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

export const router = createBrowserRouter([
  // 1. RUTA PÚBLICA
  {
    path: "/login",
    element: <Login />,
  },

  // 2. RUTAS PROTEGIDAS
  {
    path: "/",
    element: <ProtectedRoute />, // Guardián general (solo logueados)
    children: [
      {
        element: <AppLayout />,
        children: [
          
          // A) ZONA EXCLUSIVA (SOLO ADMINS/SOPORTE)
          // Aquí dejamos solo lo que un empleado normal NO debe ver (Dashboard general, Usuarios, Reportes)
          {
            element: <ProtectedRoute allowedRoles={["SOPORTE", "DIRECCION GENERAL"]} />,
            children: [
              { index: true, element: <Dashboard /> }, 
              { path: "users", element: <Users /> },
              { path: "users/new", element: <CreateUser /> }, // <-- RUTA NUEVA AGREGADA
              { path: "reports", element: <div className="p-10 text-slate-400">🚧 Reportes</div> },
            ]
          },

          // B) ZONA COMÚN (PARA TODOS LOS LOGUEADOS)
          // Aquí movimos los TICKETS para que Berna y Ana puedan entrar
          {
            children: [
              // --- SECCIÓN TICKETS (ACCESIBLE PARA TODOS) ---
              { path: "tickets", element: <Tickets /> },
              { path: "tickets/:id", element: <TicketDetail /> },
              { path: "tickets/new", element: <CreateTicket /> },

              // --- SECCIÓN TAREAS (ACCESIBLE PARA TODOS) ---
              { path: "my-tasks", element: <UserDashboard /> },
              { path: "my-tasks/new", element: <CreateTask /> },
              { path: "my-tasks/:id", element: <TaskDetail /> },
              { path: "my-tasks/assigned", element: <AssignedTasksList /> },
              { path: "my-tasks/delegated", element: <MyAssignedTasksList /> },
              { path: "my-tasks/personal", element: <PersonalTasksList /> },
              { path: "settings", element: <div className="p-10 text-slate-400">⚙️ Configuración</div> },
            ]
          }
        ]
      }
    ],
  },

  // Redirección por defecto
  { path: "*", element: <Navigate to="/login" /> }
]);