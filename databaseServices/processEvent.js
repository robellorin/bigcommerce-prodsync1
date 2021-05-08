const { addEvent } = require("./eventsController");

const processEvent = async (type, id) => {
  // each event is added to databse, with processed flag set to false.
  await addEvent({ eventType: type, eventId: id });
};

module.exports = { processEvent };
