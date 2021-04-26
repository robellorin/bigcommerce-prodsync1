const _ = require("lodash");

const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");

const { categoryMigrator } = require("./categoryMigrator");
const { brandMigrator } = require("./brandMigrator");
const { imageMigrator } = require("./imageMigrator");
const { variantMigrator } = require("./variantMigrator");
const { listingMigrator } = require("./listingMigrator");

const productMigrator = async (id) => {
  let result;
  const carriedCategories = [];
  let carriedBrand = 0;

  let responseFromA = await BigCommerceStoreA.get(`/catalog/products/${id}?include=variants`);

  if (responseFromA.data.brand_id) {
    const brand = await brandMigrator(responseFromA.data.brand_id);
    carriedBrand = brand.id;
  }

  const categoryIdsOnA = responseFromA.data.categories;
  for (const categoryId of categoryIdsOnA) {
    const cat = await categoryMigrator(categoryId);
    carriedCategories.push(cat.id);
  }

  const productOnA = responseFromA.data;

  const responseFromB = await BigCommerceStoreB.get(`/catalog/products?sku=${escape(productOnA.sku)}&include=variants`);
  const productOnB = responseFromB.data[0];

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

      await BigCommerceStoreB.put(`/catalog/products/${productOnB.id}`, product);
      result = product;
    } else {
      result = productOnB;
    }
  } else {
    const product = { ...productOnA, categories: [...carriedCategories], brand_id: carriedBrand };
    delete product.id;
    delete product.variants;
    delete product.images;

    const createdProduct = await BigCommerceStoreB.post(`/catalog/products`, product);

    result = createdProduct.data;
  }

  await imageMigrator(id, result.id);

  if (productOnA.variants.length >= 1 && productOnA.variants[0].sku !== productOnA.sku) {
    await variantMigrator(id, result.id, productOnA.sku, result.sku);
  }

  await listingMigrator(result.id);

  return result;
};

module.exports = { productMigrator };
