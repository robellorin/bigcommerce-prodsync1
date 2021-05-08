const { STORE_B_CHANNEL_ON_STORE_A } = require("../utils/config");
const { BigCommerceStoreA } = require("../stores/stores");

const availabilityMigrator = async (id) => {
  // if channel has product listed and state active, set product as available
  const listing = await BigCommerceStoreA.get(`/channels/${STORE_B_CHANNEL_ON_STORE_A}/listings?product_id%3Ain=${id}`);

  if (listing.data.length === 1) {
    return listing.data[0].state === "active" ? "available" : "disabled";
  }

  return "disabled";
};

module.exports = { availabilityMigrator };
