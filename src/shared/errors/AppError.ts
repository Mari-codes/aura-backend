export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 400, code = "BAD_REQUEST") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    
    Error.captureStackTrace?.(this, AppError);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}