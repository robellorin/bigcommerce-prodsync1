const logger = require("./logger");
const { BigCommerceStoreA } = require("../stores/stores");
const { APP_URL } = require("./config");

const scopes = [
  { scope: "store/product/created", destination: "/webhooks/products/created" },
  { scope: "store/product/updated", destination: "/webhooks/products/updated" },
  { scope: "store/sku/created", destination: "/webhooks/sku/created" },
  { scope: "store/sku/updated", destination: "/webhooks/sku/updated" },
  { scope: "store/category/created", destination: "/webhooks/categories/created" },
  { scope: "store/category/updated", destination: "/webhooks/categories/updated" },
];

module.exports = async () => {
  logger.info("Clearing all previous hooks in a moment...");

  const currentHooks = await BigCommerceStoreA.get("/hooks");

  for (const hook of currentHooks.data) {
    await BigCommerceStoreA.delete(`/hooks/${hook.id}`);
  }

  logger.info("Creating New Hooks...");

  for (const scope of scopes) {
    const body = {
      scope: scope.scope,
      destination: `${APP_URL}${scope.destination}`,
      is_active: true,
    };

    await BigCommerceStoreA.post("/hooks", body);
  }

  logger.info("Hooks are Created. Listening...");
};
