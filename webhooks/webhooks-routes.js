const router = require('express').Router();
const BigCommerce = require('node-bigcommerce');

const bigCommerce = new BigCommerce({
clientId: process.env.CLIENTID,
accessToken: process.env.ACCESSTOKEN,
storeHash: process.env.STOREHASH,
responseType: 'json'
});

router.use('/products', require('./product/product.routes'));


module.exports = router;
