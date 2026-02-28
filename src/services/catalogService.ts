const API_URL = "https://tickets-backend-api-gxbkf5enbafxcvb2.francecentral-01.azurewebsites.net/api";

// --- INTERFACES ---

export interface Branch {
  iIdBranch: number;
  sBranch: string;
  bActive: boolean;
}

export interface Department {
  iIdDepartment: number;
  sDepartment: string;
  bActive: boolean;
}

export interface Status {
  iIdStatus: number;
  sStatus: string;
  bActive: boolean;
}

// Agregamos esta interfaz que faltaba
export interface TaskType {
  iIdTaskType: number;
  sTaskType: string;
  bActive: boolean;
}

// --- HELPER GENÉRICO ---

const fetchCatalog = async <T>(endpoint: string): Promise<T[]> => {
  const token = localStorage.getItem('token');
  if (!token) return [];

  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) throw new Error(`Error fetching ${endpoint}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

// --- EXPORTACIONES ---

export const getBranches = () => fetchCatalog<Branch>("general/branches");
export const getDepartments = () => fetchCatalog<Department>("general/departments");
export const getStatuses = () => fetchCatalog<Status>("general/status");

// Esta es la función que te faltaba y causaba el error en UserDashboard:
export const getTaskTypes = () => fetchCatalog<TaskType>("general/task-types");