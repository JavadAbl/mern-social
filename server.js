const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  // eslint-disable-next-line no-process-exit
  process.exit(1);
});

dotenv.config({ path: "./.env" });

const dbUrl = process.env.DB_URL;
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log(err.name, ": ", err.message);
  });

const port = process.env.PORT;
const server = app.listen(port);
console.log(process.env.NODE_ENV);

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  // eslint-disable-next-line no-process-exit
  server.close(() => process.exit(1));
});
