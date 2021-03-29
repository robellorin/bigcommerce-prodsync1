const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");

const imageMigrator = async (productIdA, productIdB) => {
  console.log("29", "image migrator starting");

  console.log("30", "get images on A");
  const responseFromA = await BigCommerceStoreA.get(`/catalog/products/${productIdA}/images`);
  const imagesOnA = responseFromA.data;

  console.log("31", "change images array for post on B");
  const images = imagesOnA.map((image) => {
    return {
      description: image.description,
      image_url: image.url_standard,
    };
  });

  console.log("32", "get images on B");
  const responseFromB = await BigCommerceStoreB.get(`/catalog/products/${productIdB}/images`);
  const imagesOnB = responseFromB.data;

  console.log("33", "start deleting all images on B");
  for (const image of imagesOnB) {
    console.log("34", "delete an image on B");
    await BigCommerceStoreB.delete(`/catalog/products/${productIdB}/images/${image.id}`);
    console.log("35", "image deleted on B");
  }
  console.log("36", "all images deleted on B");

  console.log("37", "start creating all images on B");
  for (const image of images) {
    console.log("38", "create an image on B");
    await BigCommerceStoreB.post(`/catalog/products/${productIdB}/images`, image);
    console.log("39", "image created on B");
  }
  console.log("40", "all images created on B");

  console.log("41", "exit image migrator");

  return "Image Sync OK";
};

module.exports = { imageMigrator };
