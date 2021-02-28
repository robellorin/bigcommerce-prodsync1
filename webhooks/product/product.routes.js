const router = require("express").Router();
// TODO: Need to refactor endpoints

const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");

const productWebhookFunc = (req, res) => {
  const responseA = req.body;
  console.log('- received a webhook:')
  console.log(responseA)
  BigCommerceStoreA.get(`/catalog/products/${responseA.data.id}`).then((resA) => {
    const product = resA.data;
    BigCommerceStoreB.get(`/catalog/products/?name=${product.name}&page=1&limit=50`).then((resB) => {
      if (resB.data && resB.data.length>0) {
        const existingProduct = resB.data[0];
        BigCommerceStoreB.put(
          `/catalog/products/${existingProduct.id}`,
          existingProduct
        ).then((data) => {
          console.log("Product is successfully updated in StoreB")
          res.sendStatus(200).end;
        })
        .catch(err=> {
          console.log("failed updating products")
          console.log(err)
          res.sendStatus(400).end;
        })
      }
      else {
        BigCommerceStoreB.post(
          `/catalog/products`,
          product
        ).then((data) => {
          console.log("Product is successfully created in StoreB")
          res.sendStatus(200).end;
        })
        .catch(err=> {
          console.log("failed creating products details in StoreB")
          console.log(err)
          res.sendStatus(400).end;
        })
      }
    })
  });
}

router.post("/created-storeA", productWebhookFunc);

router.post("/updated-storeA", productWebhookFunc);

module.exports = router;
