import { MongoClient, Database } from "mongo";
import { ManagerSchema, PersonaSchema, CometaSchema } from "./schema.ts";
import { config } from "std/dotenv/mod.ts";

await config({ export: true, allowEmptyValues: true });

const connectMongoBD = async () : Promise<Database> => {
    const mongo_usr = Deno.env.get("MONGO_USR");
    const mongo_pwd = Deno.env.get("MONGO_PWD");
    const db_name = Deno.env.get("DB_NAME");
    const mongo_uri = Deno.env.get("MONGO_URI");

    if(!mongo_usr || !mongo_pwd || !db_name || !mongo_uri) { 
        throw new Error("No se han encontrado las variables de entorno, has de crear un fichero .env");
    }

    const mongo_url = `mongodb+srv://${mongo_usr}:${mongo_pwd}@${mongo_uri}/${db_name}?authMechanism=SCRAM-SHA-1`;

    const cliente = new MongoClient();
    await cliente.connect(mongo_url);
    const db = cliente.database(db_name);
    return db;
}

const db = await connectMongoBD();
console.info(`MongoDB ${db.name} connected`);

export const managersCollection = db.collection<ManagerSchema>("managers");
export const personasCollection = db.collection<PersonaSchema>("personas");
export const cometasCollection = db.collection<CometaSchema>("cometas");