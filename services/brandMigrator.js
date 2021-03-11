var _ = require("lodash");

const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");

const brandMigrator = async (id) => {
  const responseFromA = await BigCommerceStoreA.get(`/catalog/brands/${id}`);
  const brandOnA = responseFromA.data;

  const responseFromB = await BigCommerceStoreB.get(`/catalog/brands/?name=${escape(brandOnA.name)}`);
  const brandOnB = responseFromB.data[0];

  if (responseFromB.data && responseFromB.data.length > 0) {
    let A = { ...brandOnA };
    delete A.id;
    delete A.custom_url;
    let B = { ...brandOnB };
    delete B.id;
    delete B.custom_url;

    console.log(_.isEqual(A, B));
    console.log("brand equality comparison done");

    if (!_.isEqual(A, B)) {
      const brand = { ...A, id: brandOnB.id };

      await BigCommerceStoreB.put(`/catalog/brands/${brandOnB.id}`, brand);
      console.log(`${brand.name} brand updated in Store B`);
      return brand;
    } else {
      console.log(brandOnB);
      return brandOnB;
    }
  } else {
    const brand = { ...brandOnA };
    delete brand.id;

    const createdBrand = await BigCommerceStoreB.post(`/catalog/brands`, brand);
    console.log(`${brand.name} brand created in Store B`);
    return createdBrand.data;
  }
};

module.exports = { brandMigrator };
