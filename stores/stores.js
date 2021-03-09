const BigCommerce = require("node-bigcommerce");

const {
  STORE_A_ACCESS_TOKEN,
  STORE_A_CLIENT_ID,
  STORE_A_HASH,
  STORE_B_ACCESS_TOKEN,
  STORE_B_CLIENT_ID,
  STORE_B_HASH,
} = require("../utils/config");

const BigCommerceStoreA = new BigCommerce({
  clientId: STORE_A_CLIENT_ID,
  accessToken: STORE_A_ACCESS_TOKEN,
  storeHash: STORE_A_HASH,
  responseType: "json",
  apiVersion: "v3",
});

const BigCommerceStoreB = new BigCommerce({
  clientId: STORE_B_CLIENT_ID,
  accessToken: STORE_B_ACCESS_TOKEN,
  storeHash: STORE_B_HASH,
  responseType: "json",
  apiVersion: "v3",
});

module.exports = { BigCommerceStoreA, BigCommerceStoreB };
