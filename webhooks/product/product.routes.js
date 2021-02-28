const router = require("express").Router();
// TODO: Need to refactor endpoints

const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");

router.post("/created-storeA", (req, res) => {
  const responseA = req.body;
  console.log('product is created')
  console.log(responseA)
  BigCommerceStoreA.get(`/products/${responseA.data.id}`).then((res) => {
    const product = JSON.parse(res.data);
    console.log(product)
    BigCommerceStoreB.post(
      `/products`,
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

  res.send(200).end;
});

router.post("/updated-storeA", (req, res) => {
  const responseA = req.body;
  console.log('product is updated')
  console.log(responseA)
  BigCommerceStoreA.get(`/products/${responseA.data.id}`).then((res) => {
    const product = JSON.parse(res.data);
    BigCommerceStoreB.put(
      `/products/${responseA.data.id}`,
      product
    ).then((data) => {})
    .catch(err=> {
      console.log("failed updating products")
      console.log(err)
    })
  });

  res.send(200).end;
});

// router.post("/created-storeB", (req, res) => {
//     const responseB = req.body;

//     BigCommerceStoreB.get(`/products/${responseB.data.id}`).then((res) => {
//       const product = JSON.parse(res.data);
//       BigCommerceStoreA.post(
//         `/products/${responseB.data.id}`,
//         product
//       ).then((data) => {});
//       // Catch any errors, or handle the data returned
//     });
  
//     res.send(200).end;
// });

// router.post("/updated-storeB", (req, res) => {
//     const responseB = req.body;

//     BigCommerceStoreB.get(`/products/${responseB.data.id}`).then((res) => {
//       const product = JSON.parse(res.data);
//       BigCommerceStoreA.put(
//         `/products/${responseB.data.id}`,
//         product
//       ).then((data) => {});
//       // Catch any errors, or handle the data returned
//     });
  
//     res.send(200).end;
// });

module.exports = router;
