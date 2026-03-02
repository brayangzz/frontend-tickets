import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import './index.css' 

import { SessionExpiredModal, triggerSessionExpired } from './components/modals/SessionExpiredModal'

const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const response = await originalFetch(input, init);

  // Extraemos la URL a la que se está haciendo la petición
  const urlStr = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url);

  // LA MAGIA CORREGIDA: 
  // Si da 401 Y la URL NO incluye la palabra 'login', disparamos el modal.
  if (response.status === 401 && !urlStr.includes('login')) {
    triggerSessionExpired();
    return new Promise(() => {}); // Congelamos la pantalla
  }

  // Si es un 401 pero viene del login, dejamos que pase normalmente 
  // para que el formulario muestre su propio mensaje de error.
  return response;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <>
      <RouterProvider router={router} />
      <SessionExpiredModal />
    </>
  </React.StrictMode>,
)