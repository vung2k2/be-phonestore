import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import slugify from "slugify";
import ExcelJS from "exceljs";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

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

const importProductsFromExcel = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.getWorksheet(1);
  const failedProducts = []; // Mảng lưu trữ sản phẩm bị lỗi

  const promises = []; // Mảng lưu trữ các Promise của việc tạo sản phẩm

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Bỏ qua dòng tiêu đề

    const slug = slugify(row.getCell(1).value, { lower: true });
    const productData = {
      name: row.getCell(1).value,
      category: row.getCell(2).value,
      imageUrl: row.getCell(3).value,
      videoUrl: row.getCell(4).value,
      oldPrice: row.getCell(5).value,
      newPrice: row.getCell(6).value,
      chip: row.getCell(7).value,
      ram: row.getCell(8).value,
      rom: row.getCell(9).value,
      screen: row.getCell(10).value,
      pin: row.getCell(11).value,
      selfieCam: row.getCell(12).value,
      behindCam: row.getCell(13).value,
      chargeSpeed: row.getCell(14).value,
      quantity: row.getCell(15).value,
      slug,
    };

    const createProductPromise = Product.create(productData).catch((error) => {
      failedProducts.push(productData.name);
    });

    promises.push(createProductPromise);
  });

  // Đợi tất cả các tác vụ không đồng bộ hoàn thành
  await Promise.all(promises);

  // Trả về kết quả dựa trên các sản phẩm bị lỗi
  if (failedProducts.length > 0) {
    return {
      status: false,
      message: "Lỗi không thêm được 1 số sản phẩm!",
      data: { failedProducts: failedProducts },
    };
  } else {
    return {
      status: true,
      message: "Đã thêm tất cả sản phẩm!",
    };
  }
};

const getProducts = async (query) => {
  try {
    const {
      page = 1,
      perPage = 10,
      sort = "_id",
      order = "ASC",
      filter = "{}",
    } = query;

    const filterObj = JSON.parse(filter);
    const sortObj = { [sort]: order === "ASC" ? 1 : -1 };

    // Tạo bộ lọc dựa trên filterObj
    const queryObj = {};
    if (filterObj.q) {
      queryObj.$or = [
        { name: new RegExp(filterObj.q, "i") },
        { category: new RegExp(filterObj.q, "i") },
        // Thêm các trường khác cần tìm kiếm
      ];
    }

    const products = await Product.find(queryObj)
      .sort(sortObj)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));

    const total = await Product.countDocuments(queryObj);

    return { products, total };
  } catch (error) {
    throw error;
  }
};

const getProductById = async (_id) => {
  try {
    const product = await Product.findById(_id);
    return product;
  } catch (error) {
    throw error;
  }
};

const updateProduct = async (_id, productData) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(_id, productData, {
      new: true,
    });
    if (!updatedProduct) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy sản phẩm!");
    }
    return updatedProduct;
  } catch (error) {
    throw error;
  }
};

const deleteProduct = async (_id) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(_id);
    if (!deletedProduct) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy sản phẩm!");
    }
    return deletedProduct;
  } catch (error) {
    throw error;
  }
};

const deleteProducts = async (ids) => {
  try {
    const result = await Product.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy sản phẩm!");
    }
    return ids;
  } catch (error) {
    throw error;
  }
};

const getCustomers = async (query) => {
  try {
    const {
      page = 1,
      perPage = 10,
      sort = "createdAt",
      order = "ASC",
      filter = "{}",
    } = query;
    const filterObj = JSON.parse(filter);
    const sortObj = { [sort]: order === "ASC" ? 1 : -1 };
    const queryObj = {};
    if (filterObj.q) {
      queryObj.$or = [
        { name: new RegExp(filterObj.q, "i") },
        { email: new RegExp(filterObj.q, "i") },
        { phone: new RegExp(filterObj.q, "i") },
        { address: new RegExp(filterObj.q, "i") },
      ];
    }

    const customers = await User.find(queryObj)
      .sort(sortObj)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));

    const total = await User.countDocuments(queryObj);

    return { customers, total };
  } catch (error) {
    throw error;
  }
};

const deleteCustomer = async (_id) => {
  try {
    const deletedCustomer = await User.findByIdAndDelete(_id);
    if (!deletedCustomer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy khách hàng!");
    }
    return deletedCustomer;
  } catch (error) {
    throw error;
  }
};

const deleteCustomers = async (ids) => {
  try {
    const result = await User.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy khách hàng!");
    }
    return ids;
  } catch (error) {
    throw error;
  }
};

const getOrders = async (query) => {
  try {
    const {
      page = 1,
      perPage = 10,
      sort = "createdAt",
      order = "ASC",
      filter = "{}",
    } = query;
    const filterObj = JSON.parse(filter);
    const sortObj = { [sort]: order === "ASC" ? 1 : -1 };
    const queryObj = {};
    if (filterObj.status) {
      queryObj.status = filterObj.status;
    }
    if (filterObj.q) {
      queryObj.$or = [{ orderInfo: new RegExp(filterObj.q, "i") }];
    }

    const od = await Order.find(queryObj)
      .sort(sortObj)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));

    const orderPromises = od.map(async (order) => {
      const productDetails = await Promise.all(
        order.products.map(async (product) => {
          const productDetail = await Product.findById(product.productId);
          if (!productDetail) return null;
          return {
            _id: productDetail._id,
            name: productDetail.name,
            slug: productDetail.slug,
            imageUrl: productDetail.imageUrl,
            newPrice: productDetail.newPrice,
            oldPrice: productDetail.oldPrice,
            quantity: product.quantity,
          };
        })
      );
      return {
        _id: order._id,
        total_amount: order.totalAmount,
        order_date: order.createdAt,
        provider: order.provider,
        status: order.status,
        orderInfo: order.orderInfo,
        products: productDetails,
      };
    });

    const total = await Order.countDocuments(queryObj);
    const orders = await Promise.all(orderPromises);

    return { orders, total };
  } catch (error) {
    throw error;
  }
};

export const adminService = {
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
};
