/*
 * This Function Activates Synced Products on Channels configured on Store B
 * Currently Not Used
 */
const { ACTIVATE_ON_EACH_CHANNEL, STORE_B_CHANNEL_ID } = require("../utils/config");
const { BigCommerceStoreB } = require("../stores/stores");

const activateOnChannel = async (channelId, productId) => {
  const listing = await BigCommerceStoreB.get(`/channels/${channelId}/listings?product_id%3Ain=${productId}`);

  if (listing.data.length < 1) {
    const response = await BigCommerceStoreB.get(`/catalog/products/${productId}?include=variants`);

    const variants = response.data.variants.map((variant) => {
      return {
        variant_id: variant.id,
        product_id: variant.product_id,
        name: response.data.name,
        state: "active",
      };
    });

    const newListing = {
      product_id: response.data.id,
      name: response.data.name,
      description: response.data.description,
      state: "active",
      variants: variants,
    };

    const createdListing = await BigCommerceStoreB.post(`/channels/${channelId}/listings`, [newListing]);
  } else {
    if (listing.data[0].state === "active") {
      return;
    }

    const variants = listing.data[0].variants.map((variant) => {
      return {
        product_id: variant.product_id,
        variant_id: variant.variant_id,
        state: "active",
      };
    });

    const listingToUpdate = {
      listing_id: listing.data[0].listing_id,
      product_id: listing.data[0].product_id,
      state: "active",
      variants: variants,
    };

    const updatedListing = await BigCommerceStoreB.put(`/channels/${channelId}/listings`, [listingToUpdate]);
  }
};

const listingMigrator = async (id) => {
  if (ACTIVATE_ON_EACH_CHANNEL === "true") {
    const response = await BigCommerceStoreB.get(`/channels`);
    const channels = response.data;

    for (const channel of channels) {
      await activateOnChannel(channel.id, id);
    }
  } else if (STORE_B_CHANNEL_ID) {
    await activateOnChannel(STORE_B_CHANNEL_ID, id);
  }
};

module.exports = { listingMigrator };
