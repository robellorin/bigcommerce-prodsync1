# Product Sync from Store A to Store B through bigcommerce webhook

# install node modules
npm install 
# set APP_URL to server url in .env
 - APP_URL=

# Set CLIENT_ID, ACCESS_TOKEN & STORE_HASH in .env for both STORES

# StoreA Variables
 - STORE_A_CLIENT_ID=
 - STORE_A_ACCESS_TOKEN=
 - STORE_A_HASH=

# StoreB Variables
 - STORE_B_CLIENT_ID=
 - STORE_B_ACCESS_TOKEN=
 - STORE_B_HASH=

# app will automatically generate the webhooks if not exists for product create & update events