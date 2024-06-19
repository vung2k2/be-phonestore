import { StatusCodes } from "http-status-codes";
import { adminService } from "../services/adminService.js";
import ApiError from "../utils/ApiError.js";
import fs from "fs";
import { emailValidation } from "../validations/emailValidation.js";

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Thiếu thông tin đăng nhập!");
    // if (!emailValidation(username))
    //   throw new ApiError(
    //     StatusCodes.BAD_REQUEST,
    //     "Định dạng email không hợp lệ!"
    //   );
    const result = await adminService.login(username, password);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

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

const getProducts = async (req, res, next) => {
  try {
    const { products, total } = await adminService.getProducts(req.query);
    res.setHeader("x-total-count", total.toString());
    res.status(StatusCodes.OK).json(products);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await adminService.getProductById(req.params.id);
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy sản phẩm!");
    }
    res.status(StatusCodes.OK).json(product);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await adminService.updateProduct(req.params.id, req.body);
    if (!product) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Cập nhật sản phẩm thất bại!"
      );
    }
    res.status(StatusCodes.OK).json(product);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await adminService.deleteProduct(req.params.id);
    if (!product) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Xóa sản phẩm thất bại!");
    }
    res.status(StatusCodes.OK).json(product);
  } catch (error) {
    next(error);
  }
};

const deleteProducts = async (req, res, next) => {
  try {
    const products = await adminService.deleteProducts(req.body.ids);
    if (!products) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Xóa sản phẩm thất bại!");
    }
    res.status(StatusCodes.OK).json(products);
  } catch (error) {
    next(error);
  }
};

const getCustomers = async (req, res, next) => {
  try {
    const { customers, total } = await adminService.getCustomers(req.query);
    res.setHeader("x-total-count", total.toString());
    res.status(StatusCodes.OK).json(customers);
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await adminService.deleteCustomer(req.params.id);
    if (!customer) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Xóa khách hàng thất bại!");
    }
    res.status(StatusCodes.OK).json(customer);
  } catch (error) {
    next(error);
  }
};

const deleteCustomers = async (req, res, next) => {
  try {
    const customers = await adminService.deleteCustomers(req.body.ids);
    if (!customers) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Xóa khách hàng thất bại!");
    }
    res.status(StatusCodes.OK).json(customers);
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const { orders, total } = await adminService.getOrders(req.query);
    res.setHeader("x-total-count", total.toString());
    res.status(StatusCodes.OK).json(orders);
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const order = await adminService.updateOrder(req.params.id, req.body);
    if (!order) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Cập nhật đơn hàng thất bại!"
      );
    }
    res.status(StatusCodes.OK).json(order);
  } catch (error) {
    next(error);
  }
};

const getTotalRevenue = async (req, res, next) => {
  try {
    const totalRevenue = await adminService.getTotalRevenue();
    res.status(StatusCodes.OK).json(totalRevenue);
  } catch (error) {
    next(error);
  }
};

const getTotalOrdersByStatus = async (req, res, next) => {
  try {
    const totalOrders = await adminService.getTotalOrdersByStatus(
      req.query.status
    );
    res.status(StatusCodes.OK).json(totalOrders);
  } catch (error) {
    next(error);
  }
};

const getRevenueLast30Days = async (req, res, next) => {
  try {
    const revenueLast30Days = await adminService.getRevenueLast30Days();
    res.status(StatusCodes.OK).json(revenueLast30Days);
  } catch (error) {
    next(error);
  }
};

const getRevenueYearToDate = async (req, res, next) => {
  try {
    const revenueYearToDate = await adminService.getRevenueYearToDate();
    res.status(StatusCodes.OK).json(revenueYearToDate);
  } catch (error) {
    next(error);
  }
};

export const adminController = {
  login,
  createProduct,
  importProductsFromExcel,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProducts,
  getCustomers,
  deleteCustomer,
  deleteCustomers,
  getOrders,
  updateOrder,
  getTotalRevenue,
  getTotalOrdersByStatus,
  getRevenueLast30Days,
  getRevenueYearToDate,
};
