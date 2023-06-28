import { personasCollection, cometasCollection, managersCollection } from "../db/conexiondb.ts";
import { Cometa, Manager } from "../types.ts";

export const Persona = {
    cometas: async (parent: {dni: string}): Promise<Partial<Cometa>[]> => {
        try{
            const persona = await personasCollection.findOne({dni: parent.dni});
            if(!persona){
                throw new Error("Persona no encontrada");
            }

            const susCometas = await Promise.all(persona.cometas.map(async(cometa) => {
                const esaCometa = await cometasCollection.findOne({_id: cometa});
                if(esaCometa){
                    return esaCometa;
                }
            }));

           

            return susCometas.map((cometa) => {
                return{
                    id: cometa?._id.toString(),
                    vientoMinimo: cometa?.vientoMinimo,
                    vientoMaximo: cometa?.vientoMaximo,
                    lugarVuelo: cometa?.lugarVuelo
                }
            });

        }catch(e){
            console.log("Error al obtener las cometas de la persona");
            throw new Error(e);
        }
    },
    updatedBy: async (parent: {dni: string}): Promise<Omit<Manager, "password" | "token">> => {
        try{
            const persona = await personasCollection.findOne({dni: parent.dni});
            if(!persona){
                throw new Error("Persona no encontrada");
            }

            const manager = await managersCollection.findOne({_id: persona.updatedBy});
            if(!manager){
                throw new Error("Manager no encontrado");
            }

            return{
                id: manager._id.toString(),
                usuario: manager.usuario,
            }
        }catch(e){
            console.log("Error al obtener el manager que actualizó a esa persona");
            throw new Error(e);
        }
    }
};

