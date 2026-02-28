// src/services/authService.ts

const API_URL = "https://tickets-backend-api-gxbkf5enbafxcvb2.francecentral-01.azurewebsites.net/api";

export const loginUser = async (sUser: string, sPass: string) => {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sUser, // Tu backend espera exactamente "sUser"
        sPass, // Tu backend espera exactamente "sPass"
      }),
    });

    if (!response.ok) {
      throw new Error("Credenciales incorrectas o error en el servidor");
    }

    // Asumo que tu backend devuelve algún JSON (aunque sea un 200 OK simple)
    // Si devuelve un token, aquí es donde lo capturamos.
    const data = await response.json().catch(() => ({ status: "ok" })); 
    return data;
  } catch (error) {
    throw error;
  }
};

