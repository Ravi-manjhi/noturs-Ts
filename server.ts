import app from "./app";
import http from "http";
import mongoose from "mongoose";

const PORT = process.env.PORT;
const MONGODB_URL = process.env.MONGODB_URI as string;
const NODE_ENV = process.env.NODE_ENV;

process.on("uncaughtException", (err) => {
  console.warn(err.name, err.message);
});

const server = http.createServer(app);
mongoose
  .connect(MONGODB_URL, {
    dbName: "noturs",
    bufferCommands: false,
  })
  .then(() => {
    console.info("Connected to the DATABASE");
  })
  .catch((err) => {
    throw err;
  });

server.listen(PORT, () => {
  console.info("Running ----- " + NODE_ENV);
  console.info(`server started on port http://localhost:${PORT}`);
});

process.on("unhandledRejection", (error: Error) => {
  console.warn(error.name, error.message);
});
