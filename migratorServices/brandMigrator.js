var _ = require("lodash");

const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");

const brandMigrator = async (id) => {
  let result; // variable that returns from the method

  const responseFromA = await BigCommerceStoreA.get(`/catalog/brands/${id}`);
  const brandOnA = responseFromA.data;

  const responseFromB = await BigCommerceStoreB.get(`/catalog/brands/?name=${escape(brandOnA.name)}`);
  const brandOnB = responseFromB.data[0];

  // if there is a record in STORE B, update it. if there is no record, create it.
  if (responseFromB.data && responseFromB.data.length > 0) {
    // clear store specific keys from objects
    let A = { ...brandOnA };
    delete A.id;
    delete A.custom_url;
    let B = { ...brandOnB };
    delete B.id;
    delete B.custom_url;

    // if objects from store A and STORE B are equal, do nothing. if not, update it.
    if (!_.isEqual(A, B)) {
      const brand = { ...A, id: brandOnB.id };

      await BigCommerceStoreB.put(`/catalog/brands/${brandOnB.id}`, brand);
      result = brand;
    } else {
      result = brandOnB;
    }
  } else {
    const brand = { ...brandOnA };
    delete brand.id;

    const createdBrand = await BigCommerceStoreB.post(`/catalog/brands`, brand);
    result = createdBrand.data;
  }

  return result;
};

module.exports = { brandMigrator };
