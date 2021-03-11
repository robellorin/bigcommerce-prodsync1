const _ = require("lodash");

const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");
const { categoryMigrator } = require("./categoryMigrator");
const { brandMigrator } = require("./brandMigrator");

const productMigrator = async (id) => {
  const carriedCategories = [];
  let carriedBrand = 0;

  let responseFromA = await BigCommerceStoreA.get(`/catalog/products/${id}?include=images`);

  const imageArray = responseFromA.data.images.map((image) => {
    return { image_url: image.url_standard };
  });

  // console.log(imageArray);

  responseFromA = { ...responseFromA, images: imageArray };

  if (responseFromA.data.brand_id) {
    console.log("brand migrator starting");
    const brand = await brandMigrator(responseFromA.data.brand_id);
    carriedBrand = brand.id;
  }

  // modify responsedata -> images array only includes image_url in objects

  const categoryIdsOnA = responseFromA.data.categories;

  for (const categoryId of categoryIdsOnA) {
    console.log("category migrator starting");
    const cat = await categoryMigrator(categoryId);
    carriedCategories.push(cat.id);
  }

  console.log(carriedCategories);

  //get all variants /catalog/products/${id}/variants
  //get all images /catalog/products/${id}/images

  const productOnA = responseFromA.data;

  const responseFromB = await BigCommerceStoreB.get(`/catalog/products?sku=${escape(productOnA.sku)}`);
  const productOnB = responseFromB.data[0];

  if (responseFromB.data && responseFromB.data.length > 0) {
    const product = { ...productOnA, id: productOnB.id, categories: [...carriedCategories], brand_id: carriedBrand };

    await BigCommerceStoreB.put(`/catalog/products/${productOnB.id}`, product);

    // variant migrator

    console.log(`${product.name} product updated in Store B`);
    return product;
  } else {
    const product = { ...productOnA, categories: [...carriedCategories], brand_id: carriedBrand };
    delete product.id;

    const createdProduct = await BigCommerceStoreB.post(`/catalog/products`, product);
    console.log(`${product.name} product created in Store B`);
    return createdProduct.data;
  }
};

module.exports = { productMigrator };
