const API_URL = "https://tickets-backend-api-gxbkf5enbafxcvb2.francecentral-01.azurewebsites.net/api";

export interface PersonalTask {
  iIdTask: number;
  iIdTaskType: number;
  sDescription: string;
  iIdStatus: number;       
  iIdUserRaisedTask: number;
  dTaskStartDate: string | null;
  dTaskCompletionDate: string | null;
  bActive: boolean;
  dDateUserCreate: string;
  iIdUserCreate: number; 
  iIdBranch: number | null;
  iIdDepartment: number | null;
}

export interface CreateTaskPayload {
  sName: string; // <--- AÑADIDO: Título de la tarea
  sDescription: string;
  iIdTaskType: number;
  iIdStatus: number;
  dTaskStartDate: string;
}

// Interfaz para actualizar (Basada en tu Postman)
export interface UpdateTaskPayload {
  sDescription: string;
  iIdStatus: number;
  dTaskCompletionDate: string | null;
  bActive: boolean;
}

export const getPersonalTasks = async (): Promise<PersonalTask[]> => {
  const token = localStorage.getItem('token');
  if (!token) return [];

  try {
    const response = await fetch(`${API_URL}/tasks/personal`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) throw new Error("Error al obtener tareas");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

// --- CORRECCIÓN: Ahora devuelve <any> (el JSON de la API) en lugar de <boolean> ---
export const createPersonalTask = async (task: CreateTaskPayload): Promise<any> => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await fetch(`${API_URL}/tasks/personal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(task)
    });

    if (!response.ok) throw new Error("Error al crear tarea");
    
    // IMPORTANTE: Extraemos y retornamos el JSON con los datos (y el ID) de la nueva tarea
    const data = await response.json();
    return data.result || data; 

  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updatePersonalTask = async (id: number, payload: UpdateTaskPayload): Promise<boolean> => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const response = await fetch(`${API_URL}/tasks/personal/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        console.error("Error backend:", await response.text());
        throw new Error("Error al actualizar tarea");
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const deletePersonalTask = async (id: number): Promise<boolean> => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const response = await fetch(`${API_URL}/tasks/personal/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) throw new Error("Error al eliminar tarea");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};


export const createAssignedTask = async (payload: any) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch("https://tickets-backend-api-gxbkf5enbafxcvb2.francecentral-01.azurewebsites.net/api/tasks/assigned", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.result || data;
        }
        return null;
    } catch (error) {
        console.error("Error asignando tarea:", error);
        return null;
    }
};