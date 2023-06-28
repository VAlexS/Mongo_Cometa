export type Manager = {
    id: string;
    usuario: string;
    password: string;
    token?: string;
};

export type Persona = {
    dni: string;
    nombre: string;
    apellido: string;
    cometas: Cometa[];
    updatedBy: Manager;
};

export type Cometa = {
    id: string;
    vientoMinimo: number;
    vientoMaximo: number;
    lugarVuelo?: string;
    updatedBy: Manager;
};