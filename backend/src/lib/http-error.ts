export class HttpError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'HttpError';
  }
}

export const createError = (statusCode: number, message: string, details?: unknown) =>
  new HttpError(statusCode, message, details);

