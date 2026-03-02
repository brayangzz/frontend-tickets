import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import './index.css' 

// 1. Importamos el disparador de tu modal (verifica que la ruta coincida con donde guardaste el archivo)
import { triggerSessionExpired } from './components/modals/SessionExpiredModal'

// 2. LA MAGIA: Interceptor Global de Fetch
const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  // Ejecutamos la petición tal como la programaste en tus otros archivos
  const response = await originalFetch(input, init);

  // Si el backend detecta que el token ya caducó (Error 401), lanzamos el modal
  if (response.status === 401) {
    triggerSessionExpired();
  }

  // Devolvemos la respuesta para que la app no se rompa y siga su flujo natural
  return response;
};

// 3. Renderizamos la app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)