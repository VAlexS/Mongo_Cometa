import { personasCollection } from "../db/conexiondb.ts";
import { Persona } from "../types.ts";

export const Query = {
    getPersonas: async(): Promise<Partial<Persona>[] | null> => {
        try{
            const personas = await personasCollection.find({}).toArray();
            if(personas.length === 0){
                return null;
            }

            return personas.map((persona) => {
                return{
                    dni: persona.dni,
                    nombre: persona.nombre,
                    apellido: persona.apellido
                }
            });

        }catch(e){
            console.log("Error al obtener las personas");
            throw new Error(e);
        }
    },
    getPersona: async(_: unknown, args: { dni: string }): Promise<Partial<Persona> | null> => {
        try{
            const { dni } = args;
            const esaPersona = await personasCollection.findOne({dni: dni});
            if(!esaPersona){
                return null;
            }
            
            return{
                dni: esaPersona.dni,
                nombre: esaPersona.nombre,
                apellido: esaPersona.apellido
            }

        }catch(e){
            console.log("Error al obtener esa persona por dni");
            throw new Error(e);
        }
    },
    getPersonasByName: async(_: unknown, args: {nombre: string}): Promise<Partial<Persona>[] | null> => {
        try{
            const { nombre } = args;
            const personas = await personasCollection.find({nombre: nombre}).toArray();

            if(personas.length === 0){
                return null;
            }

            return personas.map((persona) => {
                return{
                    dni: persona.dni,
                    nombre: persona.nombre,
                    apellido: persona.apellido
                }
            });


        }catch(e){
            console.log("Error al obtener esa persona por dni");
            throw new Error(e);
        }
    },
    getPersonasByApellido: async(_: unknown, args: {apellido: string}): Promise<Partial<Persona>[] | null> => {
        try{
            const { apellido } = args;
            const personas = await personasCollection.find({apellido: apellido}).toArray();

            if(personas.length === 0){
                return null;
            }

            return personas.map((persona) => {
                return{
                    dni: persona.dni,
                    nombre: persona.nombre,
                    apellido: persona.apellido
                }
            });


        }catch(e){
            console.log("Error al obtener esa persona por dni");
            throw new Error(e);
        }
    },
};

