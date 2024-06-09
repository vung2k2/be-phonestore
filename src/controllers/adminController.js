import { StatusCodes } from "http-status-codes";
import { adminService } from "../services/adminService.js";
import ApiError from "../utils/ApiError.js";
import fs from "fs";
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

const importProductsFromExcel = async (req, res, next) => {
  if (!req.file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Chưa có file tải lên!");
  }

  const filePath = req.file.path;
  try {
    const result = await adminService.importProductsFromExcel(filePath);
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  } finally {
    // Sau khi đã xử lý xong, dù có lỗi hay không, đảm bảo xóa file
    if (filePath) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Không thể xóa file:", err);
          // Xử lý lỗi nếu cần
        } else {
          console.log("File đã được xóa thành công");
        }
      });
    }
  }
};

export const adminController = { createProduct, importProductsFromExcel };
