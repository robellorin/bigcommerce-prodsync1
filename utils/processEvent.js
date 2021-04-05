const { categoryEvents, productEvents } = require("./config");
const { productMigrator } = require("../services/productMigrator");
const { categoryMigrator } = require("../services/categoryMigrator");

const processEvent = async (type, id) => {
  if (type === "category" && !categoryEvents.includes(id)) {
    categoryEvents.push(id);
  } else if (type === "product" && !productEvents.includes(id)) {
    productEvents.push(id);
  } else if (type === "sku" && !productEvents.includes(id)) {
    productEvents.push(id);
  }

  //wait for all the event triggers are collected. then start sync process for each unique entity.
  setTimeout(async () => {
    while (categoryEvents.length > 0) {
      const next = categoryEvents.shift();
      await categoryMigrator(next);
      await setTimeout(() => {}, 3000);
    }
    while (productEvents.length > 0) {
      const next = productEvents.shift();
      await productMigrator(next);
      await setTimeout(() => {}, 3000);
    }
  }, 10000);
  console.log("Finished");
};

module.exports = { processEvent };
