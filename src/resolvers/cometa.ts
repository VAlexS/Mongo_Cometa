import { cometasCollection, managersCollection } from "../db/conexiondb.ts";
import { Manager } from "../types.ts";
import { ObjectId } from "mongo";

export const Cometa = {
    updatedBy: async (parent: {id: string}): Promise<Omit<Manager, "password" | "token">> => {
        try{
            const cometa = await cometasCollection.findOne({_id: new ObjectId(parent.id)});
            if(!cometa){
                throw new Error("Cometa no encontrada");
            }

            const manager = await managersCollection.findOne({_id: cometa.updatedBy});
            if(!manager){
                throw new Error("Manager no encontrado");
            }

            return{
                id: manager._id.toString(),
                usuario: manager.usuario,
            }
        }catch(e){
            console.log("Error al obtener el manager que actualizó a esa cometa");
            throw new Error(e);
        }
    }
};