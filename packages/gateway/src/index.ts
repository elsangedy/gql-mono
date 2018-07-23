import fetch from 'node-fetch';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { GraphQLServer, Options } from 'graphql-yoga';
import { makeRemoteExecutableSchema, introspectSchema, mergeSchemas } from 'graphql-tools';

import recursive from '@gql-mono/utils/src/recursive';

const getIntrospectSchema = async uri => {
  const http = new HttpLink({ uri, fetch });

  const link = setContext((_, previousContext) => {
    const headers =
      previousContext && previousContext.graphqlContext && previousContext.graphqlContext.request
        ? previousContext.graphqlContext.request.headers
        : {};

    return {
      headers
    };
  }).concat(http);

  const schema = await recursive(() => introspectSchema(link));

  return makeRemoteExecutableSchema({ schema, link });
};

const server = async () => {
  const postSchema = await getIntrospectSchema('http://localhost:4001');
  const authorSchema = await getIntrospectSchema('http://localhost:4002');
  const authSchema = await getIntrospectSchema('http://localhost:4003');

  const linkTypeDef = `
    extend type Author {
      posts: [Post!]!
    }

    extend type Post {
      author: Author!
    }
  `;

  const schemas = [postSchema, authorSchema, authSchema, linkTypeDef];

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
    schema,
    context: req => ({ ...req })
  });

  const options = {
    port: process.env.GATEWAY_PORT
  };

  const onListening = ({ port }: Options) => console.log(`✅ Server is running on: http://localhost:${port}`);

  server.start(options, onListening);
};

server();
