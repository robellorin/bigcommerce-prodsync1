const webhooksController = require("express").Router();

const { processEvent } = require("../utils/processEvent");

const tryProcess = async (type, id, res, next) => {
  try {
    processEvent(type, id);
    res.status(200).send("OK");
  } catch (error) {
    next(error);
  }
};

webhooksController.post("/products/created", async function (req, res, next) {
  const id = req.body.data.id;
  const type = req.body.data.type;

  tryProcess(type, id, res, next);
});

webhooksController.post("/products/updated", async function (req, res, next) {
  const id = req.body.data.id;
  const type = req.body.data.type;

  tryProcess(type, id, res, next);
});

webhooksController.post("/sku/created", async function (req, res, next) {
  const id = req.body.data.sku.product_id;
  const type = req.body.data.type;

  tryProcess(type, id, res, next);
});

webhooksController.post("/sku/updated", async function (req, res, next) {
  const id = req.body.data.sku.product_id;
  const type = req.body.data.type;

  tryProcess(type, id, res, next);
});

webhooksController.post("/categories/created", async function (req, res, next) {
  const id = req.body.data.id;
  const type = req.body.data.type;

  tryProcess(type, id, res, next);
});

webhooksController.post("/categories/updated", async function (req, res, next) {
  const id = req.body.data.id;
  const type = req.body.data.type;

  tryProcess(type, id, res, next);
});

module.exports = webhooksController;
