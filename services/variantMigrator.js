const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");

const variantMigrator = async (productId, id) => {
  const responseFromA = await BigCommerceStoreA.get(`/catalog/products/${productId}/variants/${id}`);
  const categoryOnA = responseFromA.data;

  const responseFromB = await BigCommerceStoreB.get(`/catalog/categories/?name=${escape(categoryOnA.name)}`);
  const categoryOnB = responseFromB.data[0];

  if (responseFromB.data && responseFromB.data.length > 0) {
    const category = { ...categoryOnA, id: categoryOnB.id, parent_id: parentId.id };

    await BigCommerceStoreB.put(`/catalog/categories/${categoryOnB.id}`, category);
    console.log(`${category.name} category updated in Store B`);
    return category;
  } else {
    const category = { ...categoryOnA, parent_id: parentId.id };
    delete category.id;

    const createdCategory = await BigCommerceStoreB.post(`/catalog/categories`, category);
    console.log(`${category.name} category created in Store B`);
    return createdCategory.data;
  }
};

module.exports = { categoryMigrator };
