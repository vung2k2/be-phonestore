import { StatusCodes } from "http-status-codes";
import { adminService } from "../services/adminService.js";
import ApiError from "../utils/ApiError.js";
const createProduct = async (req, res, next) => {
  try {
    const imageUrl = req.file.path;
    const {
      name,
      category,
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
      quantity,
    } = req.body;

    if (
      !name ||
      !category ||
      !imageUrl ||
      !oldPrice ||
      !newPrice ||
      !chip ||
      !ram ||
      !rom ||
      !screen ||
      !pin ||
      !selfieCam ||
      !behindCam ||
      !chargeSpeed ||
      !quantity
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Nhập thiếu thông tin sản phẩm!"
      );
    } else {
      const result = await adminService.createProduct(
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
      );

      res.status(StatusCodes.CREATED).json(result);
      next();
    }
  } catch (error) {
    next(error);
  }
};

export const adminController = { createProduct };
