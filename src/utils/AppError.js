class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.operational = true;
    if (String(statusCode).startsWith("4")) this.status = "fail";
    else {
      this.status = "error";
    }

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
