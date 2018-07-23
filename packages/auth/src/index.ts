import { GraphQLServer, Options } from 'graphql-yoga';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

import throwError from '@gql-mono/utils/src/throwError';
import getAuthPayload from '@gql-mono/utils/src/getAuthPayload';

const data = [
  {
    id: '1',
    name: 'User 1',
    email: 'user1@mail.com',
    password: '$2y$12$1Hx/LcqoRdteSQqELwci/.0Cgt27xqnx2ihygqWy0bxu9euYugEt.'
  },
  {
    id: '2',
    name: 'User 2',
    email: 'user2@mail.com',
    password: '$2y$12$1Hx/LcqoRdteSQqELwci/.0Cgt27xqnx2ihygqWy0bxu9euYugEt.'
  }
];

const resolvers = {
  Query: {
    me: async (_, __, ctx) => {
      // get authentication payload
      const { userId } = getAuthPayload(ctx, process.env.AUTH_SECRET);

      const user = await data.find(item => item.id === userId);

      throwError(!user, new Error('User not found.'));

      return user;
    }
  },
  Mutation: {
    signin: async (_, args) => {
      // get user by email
      const user = await data.find(item => item.email === args.email);

      throwError(!user, new Error('Email or password invalid.'));

      // verify password
      const valid = await bcrypt.compare(args.password, user.password);

      throwError(!valid, new Error('Email or password invalid.'));

      // generate jwt token
      const token = jwt.sign({ userId: user.id }, process.env.AUTH_SECRET);

      // return token and user data
      return Promise.resolve({
        token,
        user
      });
    },
    signup: async (_, args) => {
      // check if email alredy exists
      const exists = await data.find(item => item.email === args.email);

      throwError(!!exists, new Error('Email alredy exists'));

      // encrypt password
      const password = await bcrypt.hash(args.password, 10);

      // save user in database
      const user = { id: '3', name: args.name, email: args.email, password };
      data.push(user);

      // generate jwt token
      const token = jwt.sign({ userId: user.id }, process.env.AUTH_SECRET);

      // return token and user data
      return Promise.resolve({
        token,
        user
      });
    }
  }
};

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({ ...req })
});

const options = {
  port: process.env.AUTH_PORT
};

const onListening = ({ port }: Options) => console.log(`✅ Server is running on: http://localhost:${port}`);

server.start(options, onListening);
