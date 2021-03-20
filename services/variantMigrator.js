const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");

const variantMigrator = async (productIdA, productIdB, productSkuA) => {
  const responseVariantsA = await BigCommerceStoreA.get(`/catalog/products/${productIdA}/variants`);
  const variantsOnA = responseVariantsA.data;

  if (variantsOnA.length === 1 && variantsOnA[0].sku === productSkuA) {
    console.log("no variants");
    return;
  }

  console.log("variants", variantsOnA);

  const responseOptionsA = await BigCommerceStoreA.get(`/catalog/products/${productIdA}/options`);
  const optionsOnA = responseOptionsA.data;

  console.log("options", optionsOnA);

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

    console.log(`option values`, option_values);

    const constructed_option = { ...option, product_id: productIdB, option_values: option_values };

    const optionResponseB = await BigCommerceStoreB.post(`/catalog/products/${productIdB}/options`, constructed_option);
    const optionsOnB = optionResponseB.data;

    console.log(optionsOnB);
  }

  // //variants
  // const variants = variantsOnA.map((variant) => {
  //   const optionValues = variant.option_values.map((oV) => {
  //     return {
  //       label: oV.label,
  //       option_display_name: oV.option_display_name,
  //     };
  //   });

  //   return {
  //     sku: variant.sku,
  //     option_values: optionValues,
  //   };
  // });

  // console.log(variants);

  // const responseFromB = await BigCommerceStoreB.get(`/catalog/products/${productIdB}/variants`);
  // const variantsOnB = responseFromB.data;

  // for (const variant of variantsOnB) {
  //   await BigCommerceStoreB.delete(`/catalog/products/${productIdB}/variants/${variant.id}`)
  //     .then((res) => console.log(res))
  //     .catch((err) => console.log(err));
  // }

  // for (const variant of variants) {
  //   await BigCommerceStoreB.post(`/catalog/products/${productIdB}/variants`, variant)
  //     .then((res) => console.log(res))
  //     .catch((err) => console.log(err));
  // }
};

module.exports = { variantMigrator };
