const webhooksController = require("express").Router();

const { productMigrator } = require("../services/productMigrator");
const { categoryMigrator } = require("../services/categoryMigrator");

let a = 0;

webhooksController.post("/products/created", async function (req, res) {
  if (a === 0) {
    a = 1;
    console.log("Product Created Handling Route is initiated");
    // respond with 200 OK
    const productId = req.body.data.id;
    const changeType = req.body.data.type;
    if (changeType == "product" && productId) {
      const product = await productMigrator(productId);
      a = 0;
      res.json(product);
    }
  }
});

webhooksController.post("/products/updated", async function (req, res) {
  if (a === 0) {
    a = 1;
    console.log("Product Updated Handling Route is initiated");
    // respond with 200 OK
    const productId = req.body.data.id;
    const changeType = req.body.data.type;
    if (changeType == "product" && productId) {
      const product = await productMigrator(productId);
      a = 0;
      res.json(product);
    }
  }
});

webhooksController.post("/categories/created", async function (req, res) {
  console.log("Category Created Handling Route is initiated");
  // respond with 200 OK
  const categoryId = req.body.data.id;
  const changeType = req.body.data.type;
  if (changeType == "category" && categoryId) {
    const category = await categoryMigrator(categoryId);
    res.json(category);
  } else {
    res.send("OK");
  }
});
webhooksController.post("/categories/updated", async function (req, res) {
  console.log("Product Updated Handling Route is initiated");
  // respond with 200 OK
  const categoryId = req.body.data.id;
  const changeType = req.body.data.type;
  if (changeType == "category" && categoryId) {
    const category = await categoryMigrator(categoryId);
    res.json(category);
  } else {
    res.send("OK");
  }
});

module.exports = webhooksController;
