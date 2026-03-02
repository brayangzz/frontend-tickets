import { triggerSessionExpired } from "../components/modals/SessionExpiredModal";

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});

  // 1. Inyectar el token si existe
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // 2. Inteligencia para archivos vs JSON
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(url, { ...options, headers });

    // 3. Disparar modal si el token caducó
    if (response.status === 401) {
      triggerSessionExpired();
    }

    return response;
  } catch (error) {
    console.error("Error en petición HTTP:", error);
    throw error;
  }
};