const _ = require("lodash");
const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");

const variantMigrator = async (productIdA, productIdB, productSkuA, productSkuB) => {
  console.log("44", "variant migrator starting");

  console.log("45", "get variants on A");
  const responseVariantsA = await BigCommerceStoreA.get(`/catalog/products/${productIdA}/variants`);
  const variantsOnA = responseVariantsA.data;

  // if there is only base variant, do nothing
  if (variantsOnA.length === 1 && variantsOnA[0].sku === productSkuA) {
    console.log("46", "no variants on b, returning without any process");
    return;
  }

  //TODO:delete all previous variants and options to start fresh
  console.log("47", "get variants on B");
  const responseVariantsB = await BigCommerceStoreB.get(`/catalog/products/${productIdB}/variants`);
  const variantsOnB = responseVariantsB.data;

  console.log("48", "start deleting all variants on B");
  if (variantsOnB.length && variantsOnB[0].sku !== productSkuB) {
    console.log("deleting variants");
    for (const variant of variantsOnB) {
      console.log("49", "delete an variant on B");
      await BigCommerceStoreB.delete(`/catalog/products/${productIdB}/variants/${variant.id}`);
      console.log("50", "variant deleted on B");
    }
  }
  console.log("51", "all variants deleted on B");

  const optionResponseB1 = await BigCommerceStoreB.get(`/catalog/products/${productIdB}/options`);
  const optionsOnB1 = optionResponseB1.data;

  if (optionsOnB1.length) {
    console.log("deleting options");
    for (const option of optionsOnB1) {
      await BigCommerceStoreB.delete(`/catalog/products/${productIdB}/options/${option.id}`);
    }
  }

  //in order to create variants, we need to sync all the options first
  const responseOptionsA = await BigCommerceStoreA.get(`/catalog/products/${productIdA}/options`);
  const optionsOnA = responseOptionsA.data;

  //create each option with their respective option values on Store B
  for (const option of optionsOnA) {
    delete option.id;
    const option_values = option.option_values.map((value) => {
      return {
        label: value.label,
        sort_order: value.sort_order,
        value_data: value.value_data,
        is_default: value.is_default,
      };
    });

    const constructed_option = { ...option, product_id: productIdB, option_values: option_values };

    await BigCommerceStoreB.post(`/catalog/products/${productIdB}/options`, constructed_option);
  }

  //get all created options for comparison during variant creation
  const optionResponseB = await BigCommerceStoreB.get(`/catalog/products/${productIdB}/options`);
  const optionsOnB = optionResponseB.data;
  const optionsObjectB = _.keyBy(optionsOnB, "display_name");

  //create variants
  for (const variant of variantsOnA) {
    delete variant.id;
    delete variant.product_id;
    delete variant.sku_id;

    let newOptionValues = [];
    for (const value of variant.option_values) {
      value.option_id = optionsObjectB[value.option_display_name].id;
      value.id = optionsObjectB[value.option_display_name].option_values
        .filter((item) => item.label === value.label)
        .map((i) => i.id)[0];

      newOptionValues.push(value);
    }
    variant.option_values = newOptionValues;

    await BigCommerceStoreB.post(`/catalog/products/${productIdB}/variants`, variant);
  }

  return "Variant Sync OK";
};

module.exports = { variantMigrator };
