var _ = require("lodash");
const logger = require("../utils/logger");

const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");

const brandMigrator = async (id) => {
  console.log("4", "brand migrator starting");
  let result;

  console.log("5", "get brand on A");
  const responseFromA = await BigCommerceStoreA.get(`/catalog/brands/${id}`);
  const brandOnA = responseFromA.data;

  console.log("6", "get brand on B");
  const responseFromB = await BigCommerceStoreB.get(`/catalog/brands/?name=${escape(brandOnA.name)}`);
  const brandOnB = responseFromB.data[0];

  console.log("7", "apply magic on brand");
  if (responseFromB.data && responseFromB.data.length > 0) {
    let A = { ...brandOnA };
    delete A.id;
    delete A.custom_url;
    let B = { ...brandOnB };
    delete B.id;
    delete B.custom_url;

    if (!_.isEqual(A, B)) {
      const brand = { ...A, id: brandOnB.id };

      console.log("8", "update brand on B");
      await BigCommerceStoreB.put(`/catalog/brands/${brandOnB.id}`, brand);
      console.log("9", "brand updated on B");
      result = brand;
    } else {
      console.log("8", "brands are equal on A and B");
      result = brandOnB;
      console.log("9", "return same brand object");
    }
  } else {
    console.log("8", "no brand match on B, creating");
    const brand = { ...brandOnA };
    delete brand.id;

    const createdBrand = await BigCommerceStoreB.post(`/catalog/brands`, brand);
    console.log("9", "brand created on B");
    result = createdBrand.data;
  }

  console.log("10", "exit brand migrator");
  return result;
};

module.exports = { brandMigrator };
