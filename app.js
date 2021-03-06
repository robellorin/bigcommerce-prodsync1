const config = require("./utils/config");
const express = require("express");
require("express-async-errors");
const cors = require("cors");
const mongoose = require("mongoose");

const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const manageHooks = require("./utils/manageHooks");
const syncer = require("./databaseServices/syncScheduler");
const cleaner = require("./databaseServices/cleanScheduler");

const webhooksController = require("./routes/webhooks");

const app = express();

logger.info("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connecting to MongoDB:", error.message);
  });

logger.info("Starting App...");

// delete existing hooks, create new hooks
manageHooks();

// set up the cron scheduler to trigger sync process
syncer();

// set up the cron scheduler to clean proccessed records from the database
cleaner();

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(middleware.requestLogger);

app.use("/webhooks", webhooksController);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
