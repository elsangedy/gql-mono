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

const server = async () => {
  const postSchema = await getIntrospectSchema('http://localhost:4001/graphql');
  const authorSchema = await getIntrospectSchema('http://localhost:4002/graphql');

  const linkTypeDef = `
    extend type Author {
      posts: [Post!]!
    }

    extend type Post {
      author: Author!
    }
  `;

  const schemas = [postSchema, authorSchema, linkTypeDef];

  const resolvers = {
    Author: {
      posts: {
        fragment: `... on Author { id }`,
        resolve(author, _, context, info) {
          return info.mergeInfo.delegateToSchema({
            schema: postSchema,
            operation: 'query',
            fieldName: 'postsByAuthor',
            args: {
              author_id: author.id
            },
            context,
            info
          });
        }
      }
    },
    Post: {
      author: {
        fragment: `... on Post { author_id }`,
        resolve(post, _, context, info) {
          return info.mergeInfo.delegateToSchema({
            schema: authorSchema,
            operation: 'query',
            fieldName: 'author',
            args: {
              id: post.author_id
            },
            context,
            info
          });
        }
      }
    }
  };

  const schema = mergeSchemas({
    schemas,
    resolvers
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
