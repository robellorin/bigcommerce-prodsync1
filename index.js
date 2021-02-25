const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const createWebhook = require('./webhooks/webhooks.controller');
dotenv.config();


app.use(bodyParser.json());
// when there's a post request to /webooks...
app.use('/webhooks', require('./webhooks/webhooks-routes'));


app.listen(3000, async function () {
    await createWebhook();
    console.log('Listening for webhooks on port 3000')
})