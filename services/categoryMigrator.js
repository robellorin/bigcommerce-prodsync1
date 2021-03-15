var _ = require("lodash");
var logger = require("../utils/logger");
const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");

const categoryMigrator = async (id) => {
  let result;
  let parentId = { id: 0 };

  const responseFromA = await BigCommerceStoreA.get(`/catalog/categories/${id}`);
  const categoryOnA = responseFromA.data;

  if (categoryOnA.parent_id !== 0) {
    parentId = await categoryMigrator(categoryOnA.parent_id);
  }

  const responseFromB = await BigCommerceStoreB.get(`/catalog/categories/?name=${escape(categoryOnA.name)}`);
  const categoryOnB = responseFromB.data[0];

  if (responseFromB.data && responseFromB.data.length > 0) {
    let A = { ...categoryOnA };
    delete A.id;
    let B = { ...categoryOnB };
    delete B.id;

    if (!_.isEqual(A, B)) {
      const category = { ...categoryOnA, id: categoryOnB.id, parent_id: parentId.id };

      await BigCommerceStoreB.put(`/catalog/categories/${categoryOnB.id}`, category);
      logger.info(`${category.name} category updated in Store B`);
      result = category;
    } else {
      result = categoryOnB;
    }
  } else {
    const category = { ...categoryOnA, parent_id: parentId.id };
    delete category.id;

    const createdCategory = await BigCommerceStoreB.post(`/catalog/categories`, category);
    logger.info(`${category.name} category created in Store B`);
    result = createdCategory.data;
  }

  return result;
};

module.exports = { categoryMigrator };
