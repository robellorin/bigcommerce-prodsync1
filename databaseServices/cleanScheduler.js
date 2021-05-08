const cron = require("node-cron");

const { deleteProcessedEvents } = require("./eventsController");

module.exports = async () => {
  // delete processed events from db every 2 hours
  const cleaner = cron.schedule("* */2 * * *", async () => {
    await deleteProcessedEvents();
  });

  cleaner.start();
};
