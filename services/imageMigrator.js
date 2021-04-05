const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");

const imageMigrator = async (productIdA, productIdB) => {
  const responseFromA = await BigCommerceStoreA.get(`/catalog/products/${productIdA}/images`);
  const imagesOnA = responseFromA.data;

  const images = imagesOnA.map((image) => {
    return {
      description: image.description,
      image_url: image.url_standard,
    };
  });

  const responseFromB = await BigCommerceStoreB.get(`/catalog/products/${productIdB}/images`);
  const imagesOnB = responseFromB.data;

  for (const image of imagesOnB) {
    await BigCommerceStoreB.delete(`/catalog/products/${productIdB}/images/${image.id}`);
  }

  for (const image of images) {
    await BigCommerceStoreB.post(`/catalog/products/${productIdB}/images`, image);
  }

  return "Image Sync OK";
};

module.exports = { imageMigrator };
