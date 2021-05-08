const _ = require("lodash");

const { STORE_B_CHANNEL_ON_STORE_A } = require("../utils/config");
const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");

const { categoryMigrator } = require("./categoryMigrator");
const { brandMigrator } = require("./brandMigrator");
const { imageMigrator } = require("./imageMigrator");
const { variantMigrator } = require("./variantMigrator");
const { availabilityMigrator } = require("./availabilityMigrator");

const productMigrator = async (id) => {
  let result; // variable that returns from the method
  const carriedCategories = []; // array to hold matching category ids of STORE B
  let carriedBrand = 0; // array to hold matching brand id of STORE B

  let responseFromA = await BigCommerceStoreA.get(`/catalog/products/${id}?include=variants`);

  // if product on A has a brand, start brand migrator and get corresponding id from STORE B
  if (responseFromA.data.brand_id) {
    const brand = await brandMigrator(responseFromA.data.brand_id);
    carriedBrand = brand.id;
  }

  // extract categories of the product
  const categoryIdsOnA = responseFromA.data.categories;

  // start category migrator for each category and get corresponding ids from STORE B
  for (const categoryId of categoryIdsOnA) {
    const cat = await categoryMigrator(categoryId);
    carriedCategories.push(cat.id);
  }

  const productOnA = responseFromA.data;

  // if there is a channel on A representing STORE B, use it to determine the availability of the product
  if (STORE_B_CHANNEL_ON_STORE_A) {
    const availability = await availabilityMigrator(id);
    productOnA.availability = availability;
  }

  const responseFromB = await BigCommerceStoreB.get(`/catalog/products?sku=${escape(productOnA.sku)}&include=variants`);
  const productOnB = responseFromB.data[0];

  // if there is a record in STORE B, update it. if there is no record, create it.
  if (responseFromB.data && responseFromB.data.length > 0) {
    // clear store specific keys from objects
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

    // if objects from store A and STORE B are equal, do nothing. if not, update it.
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

  // sync images
  await imageMigrator(id, result.id);

  // product with no variant has 1 variant which is representing the product itself. therefore we determine if product has variants with the following conditions
  if (productOnA.variants.length >= 1 && productOnA.variants[0].sku !== productOnA.sku) {
    //sync variants
    await variantMigrator(id, result.id, productOnA.sku, result.sku);
  }

  // await listingMigrator(result.id);

  return result;
};

module.exports = { productMigrator };
