import Product from "../models/productModel.js";

const allProducts = async () => {
  try {
    let products = await Product.find();
    return products;
  } catch (error) {
    throw new Error(error);
  }
};

export const publicService = { allProducts };
