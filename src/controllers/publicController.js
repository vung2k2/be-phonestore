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
export const publicController = { allProducts };
