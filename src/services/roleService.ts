const API_URL = "https://tickets-backend-api-gxbkf5enbafxcvb2.francecentral-01.azurewebsites.net/api";

// Definimos la estructura exacta que viene de tu backend (según tu captura)
export interface Role {
  iIdRol: number;
  sRol: string;
  bActive: boolean;
  // ... otros campos opcionales
}

export const getRoles = async (): Promise<Role[]> => {
  try {
    const response = await fetch(`${API_URL}/general/roles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener el catálogo de roles");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Role Service Error:", error);
    return []; // Retorna array vacío para no romper la app
  }
};