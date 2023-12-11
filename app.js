const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const userRouter = require("./src/routes/UserRoutes");
const postRouter = require("./src/routes/PostRoutes");
const commentRouter = require("./src/routes/commentRoutes");
const {
  errorHandler,
  notFoundHandler,
} = require("./src/controllers/ErrorController");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("./public"));
app.use(morgan("dev"));

// Routes
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);

// Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
