const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
  },
  eventId: {
    type: String,
    required: true,
  },
  isProcessed: {
    type: Boolean,
    required: true,
  },
});

eventSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Event", eventSchema);
