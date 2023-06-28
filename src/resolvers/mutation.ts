import { ObjectId } from "mongo";
import * as bcrypt from "bcrypt";
import { managersCollection, personasCollection, cometasCollection } from "../db/conexiondb.ts";
import { Manager, Persona, Cometa } from "../types.ts";
import { createJWT } from "../lib/jwt.ts";

export const Mutation = {
    registrarse: async (_: unknown, args: {usuario: string, password: string}): Promise<Omit<Manager, "password">> => {
        try{
            const { usuario, password } = args;
            const existe = await managersCollection.findOne({usuario: usuario});
            if(existe){
                throw new Error("El usuario ya existe en la base de datos");
            }

            const hashedPassword = await bcrypt.hash(password);

            const id = await managersCollection.insertOne({
                usuario: usuario,
                password: hashedPassword,
            });

            const eseUsuario = await managersCollection.findOne({_id: id});

            //cuando un manager se registra, automaticamente se le inicia la sesion
            const token = await createJWT(
                { usuario, id: eseUsuario!._id.toString() },
                Deno.env.get("JWT_SECRET") || ""
              );
            
              await managersCollection.updateOne(
                {_id: eseUsuario!._id},
                { $set: {token: token}}
              );

            return{
                id: id.toString(),
                usuario: usuario,
                token: token,
            }

            
        }catch(e){
            console.log("Error al registrarse");
            throw new Error(e);
        }
    },
    iniciarSesion: async (_: unknown, args: {usuario: string, password: string}): Promise<Omit<Manager, "password">> => {
        try{
            const { usuario, password } = args;
            const existe = await managersCollection.findOne({usuario: usuario});
            if(!existe){
                throw new Error("El usuario no existe en la base de datos");
            }

            const loggeado = existe.token;
            if(loggeado){
                throw new Error("Ya tenias la sesion iniciada");
            }

            const passwordCorrecta = await bcrypt.compare(password, existe.password);
            if(!passwordCorrecta){
                throw new Error("Contraseña incorrecta");
            }

            const token = await createJWT(
                { usuario, id: existe._id.toString() },
                Deno.env.get("JWT_SECRET") || ""
              );

              await managersCollection.updateOne(
                {_id: existe._id},
                { $set: {token: token}}
              );

              return {
                id: existe._id.toString(),
                token: token,
                usuario: existe.usuario,
              };
            
        }catch(e){
            console.log("Error al iniciar sesion");
            throw new Error(e);
        }
    },
    cerrarSesion: async (_: unknown, args: {token: string}): Promise<Omit<Manager, "password">> => {
        try{
            const { token } = args;
            const eseUsuario = await managersCollection.findOne({token: token});
            if(!eseUsuario){ //si ese usuario no tiene token, se asume que tenia la sesion cerrada
                throw new Error("Ya tenias la sesion cerrada");
            }

            await managersCollection.updateOne(
                {_id: eseUsuario._id},
                { $set: {token: ""}}
              );

              return {
                id: eseUsuario._id.toString(),
                usuario: eseUsuario.usuario,
              };

        }catch(e){
            console.log("Error al cerrar sesion");
            throw new Error(e);
        }
    },
    addCometaStock: async (_: unknown, args: {token: string; vientoMinimo: number; vientoMaximo: number}): Promise<Partial<Cometa>> => {
        try{
            const { token, vientoMinimo, vientoMaximo } = args;
            const loggeado = await managersCollection.findOne({token: token});
            if(!loggeado){
                throw new Error("No estas loggeado, esta operacion solo la puede hacer usuarios autorizados");
            }

            if( (vientoMinimo > vientoMaximo) || (vientoMinimo === vientoMaximo) ){
                throw new Error("Los rangos de viento no son coherentes");
            }

            const id = await cometasCollection.insertOne({
                vientoMinimo: vientoMinimo,
                vientoMaximo: vientoMaximo,
                updatedBy: loggeado._id,
            });

            return{
                id: id.toString(),
                vientoMinimo: vientoMinimo,
                vientoMaximo: vientoMaximo
            };

        }catch(e){
            console.log("Error al agregar una cometa al stock");
            throw new Error(e);
        }
    },
    addPersona: async (_: unknown, args: {token: string; dni: string; nombre: string; apellido: string}): Promise<Partial<Persona>> => {
        try{
            const { token, dni, nombre, apellido } = args;
            const loggeado = await managersCollection.findOne({token: token});
            if(!loggeado){
                throw new Error("No estas loggeado, esta operacion solo la puede hacer usuarios autorizados");
            }

            const esaPersona = await personasCollection.findOne({dni: dni});
            if(esaPersona){
                throw new Error("Ese DNI ya esta registrado en la BBDD con otra persona, no puede haber DNI duplicados");
            }

            await personasCollection.insertOne({
                dni: dni,
                nombre: nombre,
                apellido: apellido,
                cometas: [],
                updatedBy: loggeado._id
            });

            return{
                dni: dni,
                nombre: nombre,
                apellido: apellido,
            };

        }catch(e){
            console.log("Error al agregar una persona a la BBDD");
            throw new Error(e);
        }
    },
    comprarCometa: async (_: unknown, args: {token: string; dni: string; lugarVuelo: string}): Promise<Partial<Cometa>> => {
        try{
            const { token, dni, lugarVuelo } = args;
            

            const loggeado = await managersCollection.findOne({token: token});
            if(!loggeado){
                throw new Error("No estas loggeado, esta operacion solo la puede hacer usuarios autorizados");
            }

            const esaPersona = await personasCollection.findOne({dni: dni});

            //compruebo si esa persona esta dada de alta
            if(!esaPersona){
                throw new Error("No encontramos tu dni en la base de datos, debes darte de alta en nuestra base de datos");
            }

            
            const cometas = await cometasCollection.find({}).toArray();
            const cometaStock = cometas.find(cometa => cometa.lugarVuelo === undefined);
            if(!cometaStock){
                throw new Error("Lo siento, no tenemos cometas disponibles en stock");
            }

            //compruebo que esa persona no tenga cometa en ese mismo lugar
            const susCometas = esaPersona.cometas;
            const cometasLugar = await cometasCollection.find({_id: {$in: susCometas}}).toArray();
            const existeCometa = cometasLugar.some(cometa => cometa.lugarVuelo === lugarVuelo);
            if(existeCometa){
                throw new Error("¿Para que te va a comprar otra si ya tienes una alli?");
            }

            susCometas.push(cometaStock._id);

            
            await cometasCollection.updateOne(
                {_id: cometaStock._id},
                {$set: {lugarVuelo: lugarVuelo}}
            );

            await personasCollection.updateOne(
                {_id: esaPersona._id},
                {$set: {cometas: susCometas}}
            );

            return{
                id: cometaStock._id.toString(),
                vientoMinimo: cometaStock.vientoMinimo,
                vientoMaximo: cometaStock.vientoMaximo,
                lugarVuelo: lugarVuelo,
            };
           


           
        }catch(e){
            console.log("Error al comprar una cometa");
            throw new Error(e);
        }
    },
    setLugarVuelo: async(_: unknown, args: {token: string; cometa: string; dni: string; nuevoLugar: string}): Promise<Partial<Cometa>> => {
        try{
            const { token, cometa, dni, nuevoLugar } = args;

            const loggeado = await managersCollection.findOne({token: token});
            if(!loggeado){
                throw new Error("No estas loggeado, esta operacion solo la puede hacer usuarios autorizados");
            }

            const esaPersona = await personasCollection.findOne({dni: dni});

            //compruebo si esa persona esta dada de alta
            if(!esaPersona){
                throw new Error("No encontramos tu dni en la base de datos, debes darte de alta en nuestra base de datos");
            }
            

            //compruebo que esa cometa exista en la base de datos
            const cometaPersona = await cometasCollection.findOne({_id: new ObjectId(cometa)});
            if(!cometaPersona){
                throw new Error("Cometa no encontrada");
            }

            //compruebo que esa persona no tenga cometa en ese mismo lugar
            const susCometas = esaPersona.cometas;
            const idsCometas = susCometas.map(elem => elem.toString());

            if(!idsCometas.includes(cometa)){
                throw new Error("Acceso denegado, la cometa que intentas modificar no es tuya");
            }
            
            const cometasLugar = await cometasCollection.find({_id: {$in: susCometas}}).toArray();
            const existeCometa = cometasLugar.some(cometa => cometa.lugarVuelo === nuevoLugar);
            if(existeCometa){
                throw new Error("¿No te da pena la cometa que tienes en ese lugar abandonada?");
            }

            
            await cometasCollection.updateOne(
                {_id: cometaPersona._id},
                {$set: {lugarVuelo: nuevoLugar}}
            );

            return{
                id: cometaPersona._id.toString(),
                vientoMinimo: cometaPersona.vientoMinimo,
                vientoMaximo: cometaPersona.vientoMaximo,
                lugarVuelo: nuevoLugar,
            };

            


           
        }catch(e){
            console.log("Error al modificar el lugar de vuelo");
            throw new Error(e);
        }
    }
};