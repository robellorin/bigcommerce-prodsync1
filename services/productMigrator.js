const _ = require("lodash");
const logger = require("../utils/logger");

const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");
const { categoryMigrator } = require("./categoryMigrator");
const { brandMigrator } = require("./brandMigrator");
const { imageMigrator } = require("./imageMigrator");
const { variantMigrator } = require("./variantMigrator");

const productMigrator = async (id) => {
  let result;
  const carriedCategories = [];
  let carriedBrand = 0;

  let responseFromA = await BigCommerceStoreA.get(`/catalog/products/${id}`);

  if (responseFromA.data.brand_id) {
    logger.info("brand migrator starting");
    const brand = await brandMigrator(responseFromA.data.brand_id);
    carriedBrand = brand.id;
  }

  const categoryIdsOnA = responseFromA.data.categories;
  for (const categoryId of categoryIdsOnA) {
    logger.info("category migrator starting");
    const cat = await categoryMigrator(categoryId);
    carriedCategories.push(cat.id);
  }

  const productOnA = responseFromA.data;

  const responseFromB = await BigCommerceStoreB.get(`/catalog/products?sku=${escape(productOnA.sku)}`);
  const productOnB = responseFromB.data[0];

  if (responseFromB.data && responseFromB.data.length > 0) {
    logger.info("b exists, update sequence");

    let A = { ...productOnA };
    delete A.id;
    delete A.categories;
    delete A.brand_id;
    let B = { ...productOnB };
    delete B.id;
    delete B.categories;
    delete B.brand_id;

    if (!_.isEqual(A, B)) {
      logger.info("equality false, updating");
      const product = { ...productOnA, id: productOnB.id, categories: [...carriedCategories], brand_id: carriedBrand };

      await BigCommerceStoreB.put(`/catalog/products/${productOnB.id}`, product);
      logger.info(`${product.name} product updated in Store B`);
      result = product;
    } else {
      logger.info("equality true, no action");
      result = productOnB;
    }
  } else {
    logger.info("b non existant, create new");

    const product = { ...productOnA, categories: [...carriedCategories], brand_id: carriedBrand };
    delete product.id;

    const createdProduct = await BigCommerceStoreB.post(`/catalog/products`, product);
    logger.info(`${product.name} product created in Store B`);

    result = createdProduct.data;
  }

  await imageMigrator(id, result.id);
  await variantMigrator(id, result.id, productOnA.sku);

  logger.info("finished everything, OK");

  return result;
};

module.exports = { productMigrator };
