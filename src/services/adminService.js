import Product from "../models/productModel.js";
import slugify from "slugify";

const createProduct = async (
  name,
  category,
  imageUrl,
  videoUrl,
  oldPrice,
  newPrice,
  chip,
  ram,
  rom,
  screen,
  pin,
  selfieCam,
  behindCam,
  chargeSpeed,
  quantity
) => {
  try {
    const slug = slugify(name, { lower: true });
    const newProduct = await Product.create({
      name,
      category,
      imageUrl,
      videoUrl,
      oldPrice,
      newPrice,
      chip,
      ram,
      rom,
      screen,
      pin,
      selfieCam,
      behindCam,
      chargeSpeed,
      slug,
      quantity,
    });
    return newProduct;
  } catch (error) {
    throw error;
  }
};

export const adminService = { createProduct };
