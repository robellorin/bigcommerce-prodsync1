var _ = require("lodash");

const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");

const categoryMigrator = async (id) => {
  let result; // variable that returns from the method
  let parent = { id: 0 }; // variable to store parent category id if exists

  const responseFromA = await BigCommerceStoreA.get(`/catalog/categories/${id}`);
  const categoryOnA = responseFromA.data;

  // if category has a parent, call the event recursively for the parent category.
  if (categoryOnA.parent_id !== 0) {
    parent = await categoryMigrator(categoryOnA.parent_id);
  }

  const responseFromB = await BigCommerceStoreB.get(`/catalog/categories/?name=${escape(categoryOnA.name)}`);
  const categoryOnB = responseFromB.data[0];

  // if there is a record in STORE B, update it. if there is no record, create it.
  if (responseFromB.data && responseFromB.data.length > 0) {
    // clear store specific keys from objects
    let A = { ...categoryOnA };
    delete A.id;
    let B = { ...categoryOnB };
    delete B.id;

    // if objects from store A and STORE B are equal, do nothing. if not, update it.
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
