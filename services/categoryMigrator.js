var _ = require("lodash");

const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");

const categoryMigrator = async (id) => {
  let result;
  let parent = { id: 0 };

  const responseFromA = await BigCommerceStoreA.get(`/catalog/categories/${id}`);
  const categoryOnA = responseFromA.data;

  if (categoryOnA.parent_id !== 0) {
    parent = await categoryMigrator(categoryOnA.parent_id);
  }

  const responseFromB = await BigCommerceStoreB.get(`/catalog/categories/?name=${escape(categoryOnA.name)}`);
  const categoryOnB = responseFromB.data[0];

  if (responseFromB.data && responseFromB.data.length > 0) {
    let A = { ...categoryOnA };
    delete A.id;
    let B = { ...categoryOnB };
    delete B.id;

    if (!_.isEqual(A, B)) {
      const category = { ...categoryOnA, id: categoryOnB.id, parent_id: parent.id };

      await BigCommerceStoreB.put(`/catalog/categories/${categoryOnB.id}`, category);
      result = category;
    } else {
      result = categoryOnB;
    }
  } else {
    const category = { ...categoryOnA, parent_id: parent.id };
    delete category.id;

    const createdCategory = await BigCommerceStoreB.post(`/catalog/categories`, category);
    result = createdCategory.data;
  }

  return result;
};

module.exports = { categoryMigrator };
