// src/config/roles.ts

export const ROLES = {
    ADMIN: 1,
    JEFE_SISTEMAS: 25,
    SISTEMAS: 31,
    SOPORTE: 32, // Dani tiene este
    PRACTICANTE_SISTEMAS: 33
};

// Roles que pueden ver TODOS los tickets
export const SUPPORT_TEAM_ROLES = [
    ROLES.JEFE_SISTEMAS,
    ROLES.SISTEMAS,
    ROLES.SOPORTE,
    ROLES.PRACTICANTE_SISTEMAS,
    ROLES.ADMIN // Agregamos al Admin (1) por si acaso
];

export const isSupportUser = (roleId: number): boolean => {
    return SUPPORT_TEAM_ROLES.includes(Number(roleId));
};