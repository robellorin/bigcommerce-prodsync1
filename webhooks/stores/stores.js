const BigCommerce = require("node-bigcommerce");
const dotenv = require("dotenv");

dotenv.config();

const BigCommerceStoreA = new BigCommerce({
    clientId: process.env.STORE_A_CLIENT_ID,
    accessToken: process.env.STORE_A_ACCESS_TOKEN,
    storeHash: process.env.STORE_A_HASH,
    responseType: "json",
    apiVersion: 'v3'
  });
  const BigCommerceStoreB = new BigCommerce({
    clientId: process.env.STORE_B_CLIENT_ID,
    accessToken: process.env.STORE_B_ACCESS_TOKEN,
    storeHash: process.env.STORE_B_HASH,
    responseType: "json",
    apiVersion: 'v3'
  });

  module.exports = { BigCommerceStoreA, BigCommerceStoreB}