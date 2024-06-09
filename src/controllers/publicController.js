import { StatusCodes } from "http-status-codes";
import { publicService } from "../services/publicService.js";
const allProducts = async (req, res, next) => {
  try {
    let products = await publicService.allProducts();
    res.status(StatusCodes.OK).json(products);
  } catch (error) {
    next(error);
  }
};

const getReviews = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const reviews = await publicService.getReviews(productId);
    res.status(StatusCodes.OK).json(reviews);
  } catch (error) {
    next(error);
  }
};

export const publicController = { allProducts, getReviews };
