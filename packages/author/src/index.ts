import { GraphQLServer, Options } from 'graphql-yoga';

const data = [{ id: '1', name: 'Author 1' }, { id: '2', name: 'Author 2' }];

const resolvers = {
  Query: {
    author: (_, { id }: { id: string }) => data.find(item => item.id === id),
    authors: () => data
  }
};

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers
});

const options = {
  port: process.env.AUTHOR_PORT,
  endpoint: process.env.AUTHOR_ENDPOINT
};

const onListening = ({ port }: Options) =>
  console.log(`
    ✅ Server is running on:
    - http://localhost:${port}
    - http://localhost:${port}/graphql
  `);

server.start(options, onListening);
