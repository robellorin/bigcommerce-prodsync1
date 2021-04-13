const Event = require("../models/event");

const getAllEvents = async () => {
  const events = await Event.find({});
  return events;
};

const getEventById = async (id) => {
  const event = await Event.findById(id);
  if (event) {
    return event;
  } else {
    return "No Event By Id";
  }
};

const getEventbyType = async (type) => {
  const event = await Event.findOne({ eventType: type, isProcessed: false });
  return event;
};

const addEvent = async ({ eventType, eventId }) => {
  const event = new Event({
    eventType,
    eventId,
    isProcessed: false,
  });

  const savedEvent = await event.save();
  return savedEvent;
};

const deleteProcessedEvents = async () => {
  await Event.deleteMany({ isProcessed: true });
  return "Deleted Processed Events";
};

const updateEventsAsProcessed = async (eventId) => {
  console.log("update event in db");

  const result = await Event.updateMany({ eventId }, { isProcessed: true });
  console.log(result);
  return result;
};

module.exports = {
  getAllEvents,
  getEventById,
  getEventbyType,
  addEvent,
  deleteProcessedEvents,
  updateEventsAsProcessed,
};
