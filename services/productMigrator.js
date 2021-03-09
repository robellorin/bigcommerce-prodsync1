const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");
const { categoryMigrator } = require("./categoryMigrator");

const productMigrator = async (id) => {
  const carriedCategories = [];

  const responseFromA = await BigCommerceStoreA.get(`/catalog/products/${id}`);

  const categoryIds = responseFromA.data.categories;

  for (const categoryId of categoryIds) {
    const cat = await categoryMigrator(categoryId);
    carriedCategories.push(cat.id);
  }

  const productOnA = responseFromA.data;

  const responseFromB = await BigCommerceStoreB.get(`/catalog/products?sku=${escape(productOnA.sku)}`);
  const productOnB = responseFromB.data[0];

  if (responseFromB.data && responseFromB.data.length > 0) {
    const product = { ...productOnA, id: productOnB.id, categories: [...carriedCategories] };

    await BigCommerceStoreB.put(`/catalog/products/${productOnB.id}`, product);

    console.log(`${product.name} product updated in Store B`);
    return product;
  } else {
    const product = { ...productOnA, categories: [...carriedCategories] };
    delete product.id;

    const createdProduct = await BigCommerceStoreB.post(`/catalog/products`, product);
    console.log(`${product.name} product created in Store B`);
    return createdProduct.data;
  }
};

module.exports = { productMigrator };
