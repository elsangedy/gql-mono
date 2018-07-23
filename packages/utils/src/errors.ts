export class UnauthenticatedError extends Error {
  constructor() {
    super('Not authenticated');
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Not authorized');
  }
}

export class InvalidTokenError extends Error {
  constructor() {
    super('Invalid token');
  }
}
