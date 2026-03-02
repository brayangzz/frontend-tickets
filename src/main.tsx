import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import './index.css' 

import { SessionExpiredModal, triggerSessionExpired } from './components/modals/SessionExpiredModal'

const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const response = await originalFetch(input, init);

  if (response.status === 401) {
    triggerSessionExpired();
    return new Promise(() => {}); 
  }

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