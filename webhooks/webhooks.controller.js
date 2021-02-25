const dotenv = require("dotenv");
const {BigCommerceStoreA, BigCommerceStoreB } = require('./stores/stores');

dotenv.config();

const productScopes = [
  { scope: "store/product/created", destination: "/webhooks/products/created" },
  { scope: "store/product/created", destination: "/webhooks/products/updated" },
];

// storeA created URL
// webhooks/products/created-storeA

// storeB created URL
// webhooks/products/created-storeB


module.exports = () => {
 
  // For Store A
  BigCommerceStoreA.get("/hooks").then((data) => {
    const webhooks = data;
    const scopes = webhooks.map((a) => a.scope);

    console.log(scopes);
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
        BigCommerceStoreA.post("/hooks", hookBody).then((data) => {
          console.log("Product webhook created");
        });
      });
    }
  });


  // For Store B
  BigCommerceStoreB.get("/hooks").then((data) => {
    const webhooks = data;
    const scopes = webhooks.map((a) => a.scope);

    console.log(scopes);
    if (
      scopes.indexOf("store/product/created") > -1 ||
      scopes.indexOf("store/product/updated") > -1
    ) {
      console.log("Product webhook already exists");
    } else {
      productScopes.forEach((el) => {
        const hookBody = {
          scope: el.scope,
          destination: `${process.env.APP_URL}${el.destination}-storeB`,
          is_active: true,
        };
        BigCommerceStoreB.post("/hooks", hookBody).then((data) => {
          console.log("Product webhook created");
        });
      });
    }
  }); 
};
