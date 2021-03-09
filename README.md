# Product Sync from Store A to Store B through bigcommerce webhook

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

3. Product Names are unique within a Store. But they can be updated. Therefore, this program uses `SKU field` to find products in Store B. In order to run without issue `SKU field` must be filled and shouldn't be changed for every product. Otherwise checking the existence of the product in Store B cannot function.

4. When a product is created on Store A, It carries all the product information to Store B. (updates if exists on Store B, creates new if doesn't exist)

5. When a product is updated on Store A, It carries all the product information to Store B. (updates if exists on Store B, creates new if doesn't exist)

6. Category information also carried to Store B as part of product creation & update.

7. When a category is created on Store A, It carries all the category information to Store B. (updates if exists on Store B, creates new if doesn't exist)

8. When a category is updated on Store A, It carries all the category information to Store B. (updates if exists on Store B, creates new if doesn't exist)

9. Categories Maintain their hierarchy.
