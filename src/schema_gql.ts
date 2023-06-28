import { gql } from "graphql_tag";

export const typeDefs = gql`
    type Manager {
        id: ID!
        usuario: String!
        password: String!
        token: String
    }

    type Persona {
        dni: String!
        nombre: String!
        apellido: String!
        cometas: [Cometa!]!
        updatedBy: Manager!
    }

    type Cometa {
        id: ID!
        vientoMinimo: Int!
        vientoMaximo: Int!
        lugarVuelo: String
        updatedBy: Manager!
    }

    type Mutation {
        registrarse(usuario: String!, password: String!): Manager!
        iniciarSesion(usuario: String!, password: String!): Manager!
        cerrarSesion(token: String!): Manager!

        addCometaStock(token: String!, vientoMinimo: Int!, vientoMaximo: Int!): Cometa!
        addPersona(token: String!, dni: String!, nombre: String!, apellido: String!): Persona!

        comprarCometa(token: String!, dni: String!, lugarVuelo: String!): Cometa!
        setLugarVuelo(token: String!, cometa: ID!, dni: String!, nuevoLugar: String!): Cometa!  
    }

    type Query {
        getPersonas: [Persona!]
        getPersona(dni: String!): Persona
        getPersonasByName(nombre: String!): [Persona!]
        getPersonasByApellido(apellido: String!): [Persona!]
    }
`;