const jwt = require("jsonwebtoken");
asyncHandler = require("express-async-handler");
const AppError = require("./AppError");

module.exports = asyncHandler((req, res, next) => {
  const token = req.headers?.authorization?.split(" ")[1];
  if (!token) throw new AppError("No token provided", 401);

  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) throw new AppError("Invalid token", 401);

    req.id = decoded.id;
    next();
  });
});
