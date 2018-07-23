import * as jwt from 'jsonwebtoken';

import throwError from './throwError';
import { InvalidTokenError, UnauthorizedError } from './errors';

export default (context, secret) => {
  const authorization = context.request.get('Authorization');

  throwError(!authorization, new UnauthorizedError());

  const token = authorization.replace('Bearer ', '');
  const payload = jwt.verify(token, secret);

  throwError(!payload, new InvalidTokenError());

  return payload;
};
