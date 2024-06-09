import mongoose from "mongoose";

// Định nghĩa schema cho sản phẩm
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
  },
  oldPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  newPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  chip: {
    type: String,
    required: true,
    trim: true,
  },
  ram: {
    type: Number,
    required: true,
    min: 0,
  },
  rom: {
    type: Number,
    required: true,
    min: 0,
  },
  screen: {
    type: String,
    required: true,
    trim: true,
  },
  pin: {
    type: Number,
    required: true,
    min: 0,
  },
  selfieCam: {
    type: String,
    required: true,
    trim: true,
  },
  behindCam: {
    type: String,
    required: true,
    trim: true,
  },
  chargeSpeed: {
    type: Number,
    required: true,
    min: 0,
  },
  rate: {
    type: Number,
    default: 0,
  },
  numberReview: {
    type: Number,
    default: 0,
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
