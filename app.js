const config = require("./utils/config");
const express = require("express");
const cors = require("cors");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const manageHooks = require("./utils/manageHooks");

const webhooksController = require("./controllers/webhooks");

const app = express();

logger.info("Starting App...");
manageHooks();

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(middleware.requestLogger);

app.use("/webhooks", webhooksController);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
