const _ = require("lodash");
const logger = require("../utils/logger");
const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");
const { categoryMigrator } = require("./categoryMigrator");
const { brandMigrator } = require("./brandMigrator");
const { imageMigrator } = require("./imageMigrator");
const { variantMigrator } = require("./variantMigrator");

const productMigrator = async (id) => {
  console.log("1", "product migrator starting");
  let result;
  const carriedCategories = [];
  let carriedBrand = 0;

  console.log("2", "get product on A");
  let responseFromA = await BigCommerceStoreA.get(`/catalog/products/${id}?include=variants`);

  if (responseFromA.data.brand_id) {
    console.log("3", "brand found, brand migrator calling");
    const brand = await brandMigrator(responseFromA.data.brand_id);
    console.log("11", "return from brand migrator");
    carriedBrand = brand.id;
  }

  console.log("12", "categories on a");
  const categoryIdsOnA = responseFromA.data.categories;
  for (const categoryId of categoryIdsOnA) {
    console.log("13", "categories found, category migrator calling");
    const cat = await categoryMigrator(categoryId);
    console.log("22", "return from category migrator");
    carriedCategories.push(cat.id);
  }
  console.log("23", "all categories successfully synced");

  const productOnA = responseFromA.data;

  console.log("24", "get product on B");
  const responseFromB = await BigCommerceStoreB.get(`/catalog/products?sku=${escape(productOnA.sku)}&include=variants`);
  const productOnB = responseFromB.data[0];

  console.log("25", "apply magic on product");
  if (responseFromB.data && responseFromB.data.length > 0) {
    let A = { ...productOnA };
    delete A.id;
    delete A.categories;
    delete A.brand_id;
    delete A.variants;
    delete A.images;
    let B = { ...productOnB };
    delete B.id;
    delete B.categories;
    delete B.brand_id;

    if (!_.isEqual(A, B)) {
      const product = { ...A, id: productOnB.id, categories: [...carriedCategories], brand_id: carriedBrand };

      console.log("26", "update product on B");
      await BigCommerceStoreB.put(`/catalog/products/${productOnB.id}`, product);
      console.log("27", "product updated on B");
      result = product;
    } else {
      console.log("26", "products are equal on A and B");
      result = productOnB;
      console.log("27", "return same product object");
    }
  } else {
    console.log("26", "no product match on B, creating");

    const product = { ...productOnA, categories: [...carriedCategories], brand_id: carriedBrand };
    delete product.id;
    delete product.variants;
    delete product.images;

    const createdProduct = await BigCommerceStoreB.post(`/catalog/products`, product);
    console.log("27", "product created on B");

    result = createdProduct.data;
  }

  console.log("28", "iniating image migrator");
  const imageSyncResponse = await imageMigrator(id, result.id);
  console.log(imageSyncResponse);
  console.log("42", "return from image migrator");

  if (productOnA.variants.length >= 1 && productOnA.variants[0].sku !== productOnA.sku) {
    console.log("43", "iniating variant migrator");
    const variantSyncResponse = await variantMigrator(id, result.id, productOnA.sku, result.sku);
    console.log(variantSyncResponse);
    console.log("44", "return from variant migrator");
  }

  console.log("99", "finished all, returning to endpoint");

  return result;
};

module.exports = { productMigrator };
