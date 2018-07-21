import { GraphQLServer, Options } from 'graphql-yoga';

const data = [
  { id: '1', title: 'Post 1', author_id: '1' },
  { id: '2', title: 'Post 2', author_id: '2' },
  { id: '3', title: 'Post 3', author_id: '1' },
  { id: '4', title: 'Post 4', author_id: '2' }
];

const resolvers = {
  Query: {
    post: (_, { id }: { id: string }) => data.find(item => item.id === id),
    posts: () => data,
    postsByAuthor: (_, { author_id }: { author_id: string }) =>
      data.filter(item => item.author_id === author_id)
  }
};

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers
});

const options = {
  port: process.env.POST_PORT,
  endpoint: process.env.POST_ENDPOINT
};

const onListening = ({ port }: Options) =>
  console.log(`
    ✅ Server is running on:
    - http://localhost:${port}
    - http://localhost:${port}/graphql
  `);

server.start(options, onListening);
