require("dotenv").config();

const STORE_A_CLIENT_ID = process.env.STORE_A_CLIENT_ID;
const STORE_A_ACCESS_TOKEN = process.env.STORE_A_ACCESS_TOKEN;
const STORE_A_HASH = process.env.STORE_A_HASH;

const STORE_B_CLIENT_ID = process.env.STORE_B_CLIENT_ID;
const STORE_B_ACCESS_TOKEN = process.env.STORE_B_ACCESS_TOKEN;
const STORE_B_HASH = process.env.STORE_B_HASH;

const APP_URL = process.env.APP_URL;
const PORT = process.env.PORT;

module.exports = {
  STORE_A_CLIENT_ID,
  STORE_A_ACCESS_TOKEN,
  STORE_A_HASH,
  STORE_B_CLIENT_ID,
  STORE_B_ACCESS_TOKEN,
  STORE_B_HASH,
  APP_URL,
  PORT,
};
