# Product Sync from Store A to Store B through bigcommerce webhook

Sync Products, Categories, Brands, Images and Variant Options and Variants using Hooks.

## Features:

- Program Can Sync Categories Independently by listening category "create" and "update" hooks.
- Program syncs products to Store B independent of their state or existence in Store B.
- Product sync happens for all "PRODUCT INFORMATION", Brand, Categories, Images and Variants.
- Any kind of field update, including variant changes and Adding Image to a product can trigger product sync process.
  - Deleting an Image does not trigger sync process, because it does not trigger any API webhook.
  - Deleting a Variant Option triggers sku created webhook. But deleting a variant option value does not trigger any API webhook.
- Depending on Image and variant count, sync process can take upto 15 seconds. Without image and variants, it takes around 3 seconds.

### Notes:

- API Server must receive a 200 response within 10 seconds of hook event trigger. Therefore, response is sent immediately and process is run afterwards.
- Product Updated Event: Check productUpdateEvents.md to see which fields trigger "updated" event.
- According to API Docs, Creating and Deleting Images should not trigger "updated" event. But in reality, creating an image triggers products/updated event twice (2 times). Deleting or updating an image doesn't trigger the event.
- Creating Variants don't trigger "updated" event. Using sku hooks to listen for variant changes.
- If you want to trigger an "updated" event, to start the store sync process, just include a field change in listed fields.

## 1. Install node modules

```
npm install
```

### You Need Following Env Variables

```
- APP_URL=
- PORT=
- STORE_A_CLIENT_ID=
- STORE_A_ACCESS_TOKEN=
- STORE_A_HASH=
- STORE_B_CLIENT_ID=
- STORE_B_ACCESS_TOKEN=
- STORE_B_HASH=
```

STORE_HASH info is part of the Store URL: https://store-{{STORE_HASH}}.mybigcommerce.com

You can get API Access Tokens from Store Dashboard: https://store-{{STORE_HASH}}.mybigcommerce.com/manage/settings/auth/api-accounts

> And App Should Be Running in The Specified URL.

## 2. If You Want To Run The App in Local Machine

```
1. Install ngrok (Visit https://ngrok.com/ and download .exe file)
2. Run Ngrok in your terminal -> ./ngrok http 3000
3. Copy Secure Forwarding Address to your .env file APP_URL key (Address looks like this: https://db52156ab43c.ngrok.io)
3. Run the app -> npm run dev

> Program starts, deletes old hooks if they exists and creates new hooks and starts listening for subscribed events.

4. Open web interface to watch requests. (http://127.0.0.1:4040)

More detailed explanation here: https://developer.bigcommerce.com/api-docs/store-management/webhooks/tutorial
```

# How The Program Runs

1. Existing Hooks are automatically deleted and New Hooks are automatically created when app starts to run. (No renew, reset, refresh etc. at the moment)
2. These Hooks are created at the respective endpoints everytime the program runs:

   1. scope: "store/product/created", destination: "/webhooks/products/created"
   2. scope: "store/product/updated", destination: "/webhooks/products/updated"
   3. scope: "store/category/created", destination: "/webhooks/categories/created"
   4. scope: "store/category/updated", destination: "/webhooks/categories/updated"
   5. scope: "store/sku/created", destination: "/webhooks/sku/created"
   6. scope: "store/sku/updated", destination: "/webhooks/sku/updated"

3. Product Names are unique within a Store. But they can be updated. Therefore, this program uses `SKU field` to find products in Store B. In order to run without issue `SKU field` must be filled and shouldn't be changed for every product. Otherwise checking the existence of the product in Store B cannot function.

4. When a product is created on Store A, It carries all the product information to Store B. (updates if exists on Store B, creates new if doesn't exist)

5. When a product is updated on Store A, It carries all the product information to Store B. (updates if exists on Store B, creates new if doesn't exist)

6. Category and Brand information also carried to Store B as part of product creation & update.

7. When a category is created on Store A, It carries all the category information to Store B. (updates if exists on Store B, creates new if doesn't exist)

8. When a category is updated on Store A, It carries all the category information to Store B. (updates if exists on Store B, creates new if doesn't exist)

9. Categories Maintain their hierarchy.
