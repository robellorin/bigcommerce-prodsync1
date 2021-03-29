var _ = require("lodash");
var logger = require("../utils/logger");
const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");

const categoryMigrator = async (id) => {
  console.log("14", "category migrator starting");
  let result;
  let parentId = { id: 0 };

  console.log("15", "get category on A");
  const responseFromA = await BigCommerceStoreA.get(`/catalog/categories/${id}`);
  const categoryOnA = responseFromA.data;

  if (categoryOnA.parent_id !== 0) {
    console.log("16", "category has a parent, call category migrator for parent");
    parentId = await categoryMigrator(categoryOnA.parent_id);
  }

  console.log("17", "get category on B");
  const responseFromB = await BigCommerceStoreB.get(`/catalog/categories/?name=${escape(categoryOnA.name)}`);
  const categoryOnB = responseFromB.data[0];

  console.log("18", "apply magic on category");
  if (responseFromB.data && responseFromB.data.length > 0) {
    let A = { ...categoryOnA };
    delete A.id;
    let B = { ...categoryOnB };
    delete B.id;

    if (!_.isEqual(A, B)) {
      const category = { ...categoryOnA, id: categoryOnB.id, parent_id: parentId.id };

      console.log("19", "update category on B");
      await BigCommerceStoreB.put(`/catalog/categories/${categoryOnB.id}`, category);
      console.log("20", "category on B updated");
      result = category;
    } else {
      console.log("19", "category is equal on A and B");
      result = categoryOnB;
      console.log("20", "return same category object");
    }
  } else {
    console.log("19", "no category match on B, creating");
    const category = { ...categoryOnA, parent_id: parentId.id };
    delete category.id;

    const createdCategory = await BigCommerceStoreB.post(`/catalog/categories`, category);
    console.log("20", "category created on B");
    result = createdCategory.data;
  }

  console.log("21", "exit category migrator");
  return result;
};

module.exports = { categoryMigrator };
