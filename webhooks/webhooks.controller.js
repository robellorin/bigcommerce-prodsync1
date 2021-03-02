const dotenv = require("dotenv");
const {BigCommerceStoreA, BigCommerceStoreB } = require('./stores/stores');

dotenv.config();

const productScopes = [
  { scope: "store/product/created", destination: "/webhooks/products/created" },
  { scope: "store/product/updated", destination: "/webhooks/products/updated" },
];

module.exports = async () => {
 
  BigCommerceStoreA.get("/hooks").then((data) => {
    const webhooks = data.data;
    console.log(webhooks);
    const scopes = webhooks.map((a) => a.scope);
    if (
      scopes.indexOf("store/product/created") > -1 ||
      scopes.indexOf("store/product/updated") > -1
    ) {
      console.log("Product webhook already exists");
    } else {
      productScopes.forEach((el) => {
        const hookBody = {
          scope: el.scope,
          destination: `${process.env.APP_URL}${el.destination}-storeA`,
          is_active: true,
        };
        console.log(hookBody);
        BigCommerceStoreA.post("/hooks", hookBody).then((data) => {
          console.log("Product webhook created");
        });
      });
    }
  });
};
