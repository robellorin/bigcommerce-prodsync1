const webhooksController = require("express").Router();

let SYNCING = 0;
let SKU_SYNCING = 0;
const { productMigrator } = require("../services/productMigrator");
const { categoryMigrator } = require("../services/categoryMigrator");

webhooksController.post("/products/created", async function (req, res, next) {
  if (SYNCING === 1) return res.send("Sync in Progress");
  SYNCING = 1;
  console.log("Product Created Handling Route is initiated");

  const productId = req.body.data.id;
  const changeType = req.body.data.type;
  if (changeType == "product" && productId) {
    try {
      const product = await productMigrator(productId);
      console.log(`product with id ${product.id} on store b is created, all syncing is finished`);
    } catch (error) {
      next(error);
      return;
    }
    SYNCING = 0;
    res.status(200).send("Finished");
    console.log("END: sent response");
    return;
  }
  return res.status(200).send("Didn't Process");
});

webhooksController.post("/products/updated", async function (req, res, next) {
  if (SYNCING === 1) return res.send("Sync in Progress");
  SYNCING = 1;
  console.log("Product Updated Handling Route is initiated");

  const productId = req.body.data.id;
  const changeType = req.body.data.type;
  if (changeType == "product" && productId) {
    try {
      const product = await productMigrator(productId);
      console.log(`product with id ${product.id} on store b is updated, all syncing is finished`);
    } catch (error) {
      next(error);
      return;
    }
    SYNCING = 0;
    res.status(200).send("Finished");
    console.log("END: sent response");
    return;
  }
  return res.status(200).send("Didn't Process");
});

webhooksController.post("/sku/created", async function (req, res, next) {
  if (SYNCING === 1) return res.send("Variant Sync in Progress");
  SYNCING = 1;
  console.log("SKU Created Handling Route is initiated");

  const productId = req.body.data.sku.product_id;
  const changeType = req.body.data.type;
  if (changeType == "sku" && productId) {
    try {
      const product = await productMigrator(productId);
    } catch (error) {
      next(error);
      return;
    }
    SYNCING = 0;
    res.status(200).send("Finished");
    console.log("END: sent response");
    return;
  }
  return res.status(200).send("Didn't Process");
});

webhooksController.post("/sku/updated", async function (req, res, next) {
  if (SYNCING === 1) return res.send("Variant Sync in Progress");
  SYNCING = 1;
  console.log("SKU Updated Handling Route is initiated");

  const productId = req.body.data.sku.product_id;
  const changeType = req.body.data.type;
  if (changeType == "sku" && productId) {
    try {
      const product = await productMigrator(productId);
      // await skuVariantMigrator(productId);
    } catch (error) {
      next(error);
      return;
    }
    SYNCING = 0;
    res.status(200).send("Finished");
    console.log("END: sent response");
    return;
  }
  return res.status(200).send("Didn't Process");
});

webhooksController.post("/categories/created", async function (req, res, next) {
  if (SYNCING === 1) return res.send("Sync in Progress");
  SYNCING = 1;
  console.log("Category Created Handling Route is initiated");

  const categoryId = req.body.data.id;
  const changeType = req.body.data.type;
  if (changeType == "category" && categoryId) {
    try {
      await categoryMigrator(categoryId);
    } catch (error) {
      next(error);
      return;
    }
    SYNCING = 0;
    res.status(200).send("Finished");
    console.log("END: sent response");
    return;
  }
  return res.status(200).send("Didn't Process");
});

webhooksController.post("/categories/updated", async function (req, res, next) {
  if (SYNCING === 1) return res.send("Sync in Progress");
  SYNCING = 1;
  console.log("Product Updated Handling Route is initiated");

  const categoryId = req.body.data.id;
  const changeType = req.body.data.type;
  if (changeType == "category" && categoryId) {
    try {
      await categoryMigrator(categoryId);
    } catch (error) {
      next(error);
      return;
    }
    SYNCING = 0;
    res.status(200).send("Finished");
    console.log("END: sent response");
    return;
  }
  return res.status(200).send("Didn't Process");
});

module.exports = webhooksController;
