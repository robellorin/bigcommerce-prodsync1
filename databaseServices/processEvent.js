const { addEvent } = require("./eventsController");

const processEvent = async (type, id) => {
  await addEvent({ eventType: type, eventId: id });
};

module.exports = { processEvent };
