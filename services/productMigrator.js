const _ = require("lodash");

const { BigCommerceStoreA, BigCommerceStoreB } = require("../stores/stores");
const { categoryMigrator } = require("./categoryMigrator");
const { brandMigrator } = require("./brandMigrator");

const productMigrator = async (id) => {
  const carriedCategories = [];
  let carriedBrand = 0;

  let responseFromA = await BigCommerceStoreA.get(
    `/catalog/products/${id}?exclude_fields=availability,availability_description,base_variant_id,date_created,date_modified,option_set_id,reviews_count,reviews_rating_sum,tax_class_id`
  );

  if (responseFromA.data.brand_id) {
    console.log("brand migrator starting");
    const brand = await brandMigrator(responseFromA.data.brand_id);
    carriedBrand = brand.id;
  }

  const categoryIdsOnA = responseFromA.data.categories;
  for (const categoryId of categoryIdsOnA) {
    console.log("category migrator starting");
    const cat = await categoryMigrator(categoryId);
    carriedCategories.push(cat.id);
  }

  const productOnA = responseFromA.data;

  const responseFromB = await BigCommerceStoreB.get(
    `/catalog/products?sku=${escape(
      productOnA.sku
    )}&exclude_fields=availability,availability_description,base_variant_id,date_created,date_modified,option_set_id,reviews_count,reviews_rating_sum,tax_class_id`
  );
  const productOnB = responseFromB.data[0];

  if (responseFromB.data && responseFromB.data.length > 0) {
    console.log("b exists, update sequence");
    let A = { ...productOnA };
    delete A.id;
    delete A.categories;
    delete A.brand_id;
    let B = { ...productOnB };
    delete B.id;
    delete B.categories;
    delete B.brand_id;

    console.log(_.isEqual(A, B));
    console.log(A);
    console.log(B);
    console.log("product equality comparison done");

    if (!_.isEqual(A, B)) {
      console.log("equality false, updating");
      const product = { ...productOnA, id: productOnB.id, categories: [...carriedCategories], brand_id: carriedBrand };

      await BigCommerceStoreB.put(`/catalog/products/${productOnB.id}`, product);
      console.log(`${product.name} product updated in Store B`);
      console.log(product);
      return product;
    } else {
      console.log("equality true, no action");
      return productOnB;
    }
  } else {
    console.log("b non existant, create new");
    const product = { ...productOnA, categories: [...carriedCategories], brand_id: carriedBrand };
    delete product.id;

    const createdProduct = await BigCommerceStoreB.post(`/catalog/products`, product);
    console.log(`${product.name} product created in Store B`);
    return createdProduct.data;
  }
};

module.exports = { productMigrator };
