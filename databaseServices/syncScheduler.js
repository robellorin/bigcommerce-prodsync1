const cron = require("node-cron");

const { getEventbyType, updateEventsAsProcessed } = require("./eventsController");
const { productMigrator } = require("../migratorServices/productMigrator");
const { categoryMigrator } = require("../migratorServices/categoryMigrator");

module.exports = async () => {
  //start syncronization every 15 seconds
  const syncer = cron.schedule("*/15 * * * * *", async () => {
    const product = await getEventbyType("product");
    if (product) {
      try {
        await productMigrator(product.eventId);
        await updateEventsAsProcessed(product.eventId);
      } catch (error) {
        console.log(error);
      }
    } else {
      const category = await getEventbyType("category");
      if (category) {
        try {
          await categoryMigrator(category.eventId);
          await updateEventsAsProcessed(category.eventId);
        } catch (error) {
          console.log(error);
        }
      }
    }
  });

  syncer.start();
};
