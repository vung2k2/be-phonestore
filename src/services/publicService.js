import Product from "../models/productModel.js";
import Rating from "../models/ratingModel.js";

const allProducts = async () => {
  try {
    let products = await Product.find();
    return products;
  } catch (error) {
    throw error;
  }
};

const getReviews = async (productId) => {
  try {
    const reviews = await Rating.find({ productId: productId }).populate(
      "userId",
      "name"
    );
    return reviews.map((review) => ({
      _id: review._id,
      userId: review.userId._id,
      userName: review.userId.name,
      rate: review.rate,
      comment: review.comment,
      createdAt: review.createdAt,
    }));
  } catch (error) {
    throw error;
  }
};

export const publicService = { allProducts, getReviews };
