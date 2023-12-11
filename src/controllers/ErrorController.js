/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
const AppError = require("../utils/AppError");

const notFoundHandler = (req, res, next) => {
  const err = new AppError(`Not Found ${req.originalUrl}`, 404);
  next(err);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.code === 11000) err = handleDuplicateFieldDB(err);
  if (err.name === "CastError") err = handleCastErrorDB(err);

  if (process.env.NODE_ENV === "production") prodError(err, res);
  if (process.env.NODE_ENV === "development") devError(err, res);
};
//---------------------------------------------------------------
// Helpers
function devError(err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
}

function prodError(err, res) {
  if (err.isOperational)
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

  res.status(500).json({
    status: "error",
    message: "An unexpected error has occurred",
  });
}

function handleDuplicateFieldDB(err) {
  const values = Object.keys(err.keyValue);
  err.statusCode = 400;
  err.status = "fail";
  err.message = `<${values}> field is already taken`;
  return err;
}

function handleCastErrorDB(err) {
  err.message = "User id is invalid";
  err.statusCode = 400;
  err.status = "fail";
  return err;
}

module.exports = { notFoundHandler, errorHandler };
