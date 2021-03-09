const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");

const categoryMigrator = async (id) => {
  let parentId = { id: 0 };

  const responseFromA = await BigCommerceStoreA.get(`/catalog/categories/${id}`);
  const categoryOnA = responseFromA.data;

  if (categoryOnA.parent_id !== 0) {
    parentId = await categoryMigrator(categoryOnA.parent_id);
  }

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
