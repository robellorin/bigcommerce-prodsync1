const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");

const imageMigrator = async (productIdA, productIdB) => {
  // get all images from STORE A
  const responseFromA = await BigCommerceStoreA.get(`/catalog/products/${productIdA}/images`);
  const imagesOnA = responseFromA.data;

  // mutate objects to our need
  const images = imagesOnA.map((image) => {
    return {
      description: image.description,
      image_url: image.url_standard,
    };
  });

  const responseFromB = await BigCommerceStoreB.get(`/catalog/products/${productIdB}/images`);
  const imagesOnB = responseFromB.data;

  // delete all images on STORE B
  for (const image of imagesOnB) {
    await BigCommerceStoreB.delete(`/catalog/products/${productIdB}/images/${image.id}`);
  }

  // add all images from STORE A
  for (const image of images) {
    await BigCommerceStoreB.post(`/catalog/products/${productIdB}/images`, image);
  }

  return "Image Sync OK";
};

module.exports = { imageMigrator };
