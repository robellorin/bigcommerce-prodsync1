# BigCommerce Product Sync

1-way sync between 2 BigCommerce stores using WebHooks. It syncs `Products` and `Categories` whenever a product/category is created or updated over the dashboard of the source store. (STORE A)

This event triggers a webhook via BigCommerce API, which this program listens for and then starts a syncronization process. After sync process is finished, an identical product/category is created or updated in the destination store. (STORE B)

## Features:

- Program can sync categories independently by listening category "create" and "update" hooks.
- Program syncs products to Store B independent of their state or existence in Store B.
- Product sync happens for all "PRODUCT INFORMATION", Brand, Categories, Images and Variants.
- Program allows user to manage products of STORE B from STORE A Dashboard. Users can set `purchasability` of STORE B products via a channel in STORE A representing STORE B.
- Program uses a MongoDB database to store webhook events.
- OK Response is sent immediately to satisfy the BigCommerce API. But each event is tracked via program by a "processed" flag. This flag set to true only after event is syncronized to Store B successfully. If for some reason (downtime, network error on Store B, etc.) event cannot be synced to Store B, it is tried again and again until succeeded.
- A cron scheduler is configured for syncronization process. (Every 15 seconds, checks new events and syncs if any)
- A cron scheduler is configured to collect and remove processed event identifiers from the database (every 2 hours, deletes all processed events)

### Managing Purchasibility of STORE B Products

Program accepts an environment variable `STORE_B_CHANNEL_ON_STORE_A` which stores the `CHANNEL ID` of a channel on `STORE A`, representing `STORE B`. (check .env.example)

If there is no `STORE_B_CHANNEL_ON_STORE_A`, program syncs products identically.

When there is a `STORE_B_CHANNEL_ON_STORE_A`, program checks if syncing product is listed on that channel and if so, whether its state is set to `active`.

- If both are true, product `availability` (availability on JSON data, `Purchasibility` on Dashboard) is set to `available`

* Otherwise `availability` set to `disabled`

Using this mechanism, you can manage product purchasibility from STORE A Dashboard. Only workflow problem at the moment is that there is no webhook to listen for channel listing events. Therefore each channel listing change must be followed by a product update, in order to trigger a product update event.

## Notes about limitations and API Behavior:

- Product Names are unique within a Store. But they can be updated in real life cases. Therefore, this program uses `SKU field` to query products in Store B and match products between stores. In order to run without issue `SKU field` must be filled and shouldn't be changed. Otherwise checking the existence of the product in Store B cannot function.
- BigCommerce WebHooks API must receive a 200 response within 10 seconds of hook event trigger. Therefore, response is sent immediately and process is run afterwards.
- Product Updated Event: Check productUpdateEvents.md to see which fields trigger "updated" event.
- According to API Docs, Creating and Deleting Images should not trigger "updated" event. But in reality, creating an image triggers products/updated event twice (2 times). Deleting or updating an image doesn't trigger the event.
- Creating Variants don't trigger "updated" event. This program uses `sku` hooks to listen for variant changes.
- If you want to trigger an "updated" event, to start the store sync process, just include a field change in listed fields.
- Any kind of field update, including variant changes and adding Image to a product can trigger product sync process.
  - Deleting an Image does not trigger sync process, because it does not trigger any API webhook.
  - Deleting a Variant Option triggers sku created webhook. But deleting a variant option value does not trigger any API webhook.
- Depending on Image and variant count, sync process can take upto 15 seconds. Without image and variants, it takes around 3 seconds.

## How To Use

#### 1. Install node modules

```
npm install
```

#### 2. Create API Access Accounts

You can get API Access Accounts from Store Dashboard: https://store-{{STORE_HASH}}.mybigcommerce.com/manage/settings/auth/api-accounts

Use Create API Account -> Create V2/V3 API Token.

- Use the following scopes when creating API credentials for the source store (STORE A)
  - Information & Settings Read-Only
  - Products Read-Only
  - Sites & Routes Read-Only
  - Channel Listings Read-Only
  - Channel Settings Read-Only
- Use the following scopes when creating API credentials for the destination store (STORE B)
  - Information & Settings Read-Only
  - Products Modify

#### 3. Configure Environment Variables

You Need Following Env Variables (Check .env.example for reference):

```
APP_URL
PORT
MONGODB_URI
SYNC_PERIOD_IN_SECS
CLEAN_PERIOD_IN_HOURS

STORE_A_CLIENT_ID: Generated when API Account is created from dashboard
STORE_A_ACCESS_TOKEN:Generated when API Account is created from dashboard
STORE_A_HASH: part of the Store URL: https://store-{{STORE_HASH}}.mybigcommerce.com

STORE_B_CLIENT_ID
STORE_B_ACCESS_TOKEN
STORE_B_HASH

STORE_B_CHANNEL_ON_STORE_A: stores the CHANNEL ID of a channel on STORE A, representing STORE B.
```

#### 4. How To Run Program Locally

```
1. Install ngrok (Visit https://ngrok.com/ and download .exe file)
2. Run Ngrok in your terminal -> ./ngrok http 3000
3. Copy Secure Forwarding Address to your .env file APP_URL key (Address looks like this: https://db52156ab43c.ngrok.io)
3. Run the app -> npm run dev
4. Open web interface to watch requests. (http://127.0.0.1:4040)
```

### Hooks

Existing hooks are automatically deleted and new hooks are automatically created when app starts to run. (No renew, reset, refresh etc. at the moment)

- Following hooks are created at the respective endpoints everytime the program runs:

  1.  scope: "store/product/created", destination: "/webhooks/products/created"
  2.  scope: "store/product/updated", destination: "/webhooks/products/updated"
  3.  scope: "store/category/created", destination: "/webhooks/categories/created"
  4.  scope: "store/category/updated", destination: "/webhooks/categories/updated"
  5.  scope: "store/sku/created", destination: "/webhooks/sku/created"
  6.  scope: "store/sku/updated", destination: "/webhooks/sku/updated"
