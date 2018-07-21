import fetch from 'node-fetch';
import { HttpLink } from 'apollo-link-http';
import { GraphQLServer } from 'graphql-yoga';
import { mergeSchemas, makeRemoteExecutableSchema, introspectSchema } from 'graphql-tools';

const getIntrospectSchema = async uri => {
  try {
    const link = new HttpLink({ uri, fetch });

    const schema = await introspectSchema(link);

    return makeRemoteExecutableSchema({ schema, link });
  } catch (e) {
    console.log(`[ERROR]: ${e.message}`, e);
  }
};

const uris = [
  'http://localhost:4001/graphql', // post
  'http://localhost:4002/graphql' // author
];

const server = async () => {
  const schemas = await Promise.all(uris.map(getIntrospectSchema));

  const schema = mergeSchemas({
    schemas
  });

  const server = new GraphQLServer({
    schema
  });

  const options = {
    port: process.env.GATEWAY_PORT,
    endpoint: process.env.GATEWAY_ENDPOINT
  };

  const onListening = ({ port }) =>
    console.log(`
    ✅ Server is running on:
    - http://localhost:${port}
    - http://localhost:${port}/graphql
  `);

  server.start(options, onListening);
};

server();
