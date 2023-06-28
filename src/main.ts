import { Server } from "std/http/server.ts";
import { GraphQLHTTP } from "gql";
import  { makeExecutableSchema } from "graphql_tools";
import { typeDefs } from "./schema_gql.ts";

import { Query } from "./resolvers/query.ts";
import { Mutation } from "./resolvers/mutation.ts";
import { Cometa } from "./resolvers/cometa.ts";
import { Persona } from "./resolvers/persona.ts";

const resolvers = {
    Query,
    Mutation,
    Cometa,
    Persona
};

//obtengo el puerto del .env
const port = Number(Deno.env.get("PORT"));


const s = new Server({
    handler: async (req) => {
      const { pathname } = new URL(req.url);
  
      return pathname === "/graphql"
        ? await GraphQLHTTP<Request>({
            schema: makeExecutableSchema({ resolvers, typeDefs }),
            graphiql: true,
          })(req)
        : new Response("Not Found", { status: 404 });
    },
    port: port,
  });
  
  s.listenAndServe();
  
 
console.log(`Server running on: http://localhost:${port}/graphql`);