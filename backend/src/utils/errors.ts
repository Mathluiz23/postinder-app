export class NotFoundError extends Error {
  status = 404;
}

export class ConflictError extends Error {
  status = 409;
}

export class BadRequestError extends Error {
  status = 400;
}

export class UnauthorizedError extends Error {
  status = 401;
}
