import { ObjectId } from "mongo";
import { Manager, Persona, Cometa } from "../types.ts";

export type ManagerSchema = Omit<Manager, "id"> & {
    _id: ObjectId;
};

export type PersonaSchema = Omit<Persona, "cometas" | "updatedBy"> & {
    _id: ObjectId;
    cometas: ObjectId[];
    updatedBy: ObjectId;
};

export type CometaSchema = Omit<Cometa, "id" | "updatedBy"> & {
    _id: ObjectId;
    updatedBy: ObjectId;
};