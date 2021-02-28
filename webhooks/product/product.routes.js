const router = require("express").Router();
// TODO: Need to refactor endpoints

const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");

router.post("/created-storeA", (req, res) => {
  const responseA = req.body;
  console.log('- received a webhook: a product is created in StoreA')
  console.log(responseA)
  BigCommerceStoreA.get(`/catalog/products/${responseA.data.id}`).then((res) => {
    const { name, weight, price, type, description, availability, sku } = res.data;
    const product = { name, weight, price, type, description, availability, sku };
    BigCommerceStoreB.post(
      `/catalog/products`,
      product
    ).then((data) => {})
    .catch(err=> {
      console.log("failed creating products details in StoreB")
      console.log(err)
    })
    // Catch any errors, or handle the data returned
  })
  .then((data) => {})
  .catch(err=> {
    console.log("failed getting products details from StoreA")
    console.log(err)
  })

  res.sendStatus(200).end;
});

router.post("/updated-storeA", (req, res) => {
  const responseA = req.body;
  console.log('- received a webhook: a product is updated in StoreA')
  console.log(responseA)
  BigCommerceStoreA.get(`/catalog/products/${responseA.data.id}`).then((res) => {
    const product = JSON.parse(res.data);
    BigCommerceStoreB.put(
      `/catalog/products/${responseA.data.id}`,
      product
    ).then((data) => {})
    .catch(err=> {
      console.log("failed updating products")
      console.log(err)
    })
  });

  res.sendStatus(200).end;
});

module.exports = router;
