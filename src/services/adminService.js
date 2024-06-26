import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import slugify from "slugify";
import ExcelJS from "exceljs";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { hashPassword, comparePassword } from "../utils/password.js";

const login = async (email, password) => {
  try {
    const user = await User.findOne({ email });

    if (
      !user ||
      !(await comparePassword(password, user.password)) ||
      user.role === "user"
    ) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Sai thông tin tài khoản!");
    }
    const accessToken = generateAccessToken({ _id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({
      _id: user._id,
      role: user.role,
    });
    user.refreshToken = refreshToken;
    await user.save();
    return {
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

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
    queryObj.role = { $ne: "admin" };
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
      order = "DESC",
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
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
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

const updateOrder = async (_id, status) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(_id, status, {
      new: true,
    });
    if (!updatedOrder) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy đơn hàng!");
    }
    return updatedOrder;
  } catch (error) {
    throw error;
  }
};

const getTotalRevenue = async () => {
  try {
    const orders = await Order.find({ status: "completed" });
    const totalRevenue = orders.reduce(
      (total, order) => total + order.totalAmount,
      0
    );
    return totalRevenue;
  } catch (error) {
    throw error;
  }
};

const getRevenueLast30Days = async () => {
  try {
    const currentDate = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Lấy các đơn hàng đã hoàn thành trong khoảng thời gian từ 30 ngày trước đến ngày hiện tại
    const orders = await Order.find({
      status: "completed",
      createdAt: { $gte: thirtyDaysAgo, $lte: currentDate },
    }).sort({ createdAt: 1 }); // Sắp xếp theo ngày tạo tăng dần để có thứ tự từ cũ đến mới

    // Tạo mảng 30 giá trị doanh thu của các ngày gần nhất
    const thirtyDayRevenue = [];
    const currentDateWithoutTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    for (let i = 0; i < 30; i++) {
      const date = new Date(currentDateWithoutTime);
      date.setDate(currentDateWithoutTime.getDate() - i);

      // Tính tổng doanh thu cho mỗi ngày
      const dailyRevenue = orders.reduce((total, order) => {
        const orderDate = new Date(order.createdAt);
        if (
          orderDate.getFullYear() === date.getFullYear() &&
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getDate() === date.getDate()
        ) {
          return total + order.totalAmount;
        }
        return total;
      }, 0);

      // Làm tròn và định dạng số doanh thu, ví dụ: 52652000 => 52.65
      const formattedRevenue = Math.round(dailyRevenue / 100000) / 10; // Chia cho 1 triệu và làm tròn 1 chữ số thập phân
      thirtyDayRevenue.unshift(formattedRevenue); // Thêm vào đầu mảng để có thứ tự từ cũ đến mới
    }

    return thirtyDayRevenue;
  } catch (error) {
    throw error;
  }
};

const getRevenueYearToDate = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // Tháng hiện tại (từ 1 đến 12)

    const startOfYear = new Date(currentYear, 0, 1); // Ngày đầu tiên của năm
    const endOfCurrentMonth = new Date(
      currentYear,
      currentMonth,
      0,
      23,
      59,
      59,
      999
    ); // Ngày cuối cùng của tháng hiện tại

    // Lấy các đơn hàng đã hoàn thành trong khoảng thời gian từ đầu năm đến cuối tháng hiện tại
    const orders = await Order.find({
      status: "completed",
      createdAt: { $gte: startOfYear, $lte: endOfCurrentMonth },
    }).sort({ createdAt: 1 });

    // Tạo mảng doanh thu theo từng tháng từ đầu năm đến tháng hiện tại
    const monthlyRevenue = Array(currentMonth).fill(0); // Mảng với số phần tử bằng số tháng từ đầu năm đến nay

    orders.forEach((order) => {
      const orderMonth = new Date(order.createdAt).getMonth(); // Lấy tháng của đơn hàng
      monthlyRevenue[orderMonth] += order.totalAmount; // Cộng doanh thu vào tháng tương ứng
    });

    // Làm tròn và định dạng số doanh thu, ví dụ: 52652000 => 52.65
    const formattedMonthlyRevenue = monthlyRevenue.map(
      (revenue) => Math.round(revenue / 100000) / 10
    ); // Chia cho 1 triệu và làm tròn 1 chữ số thập phân

    return formattedMonthlyRevenue;
  } catch (error) {
    throw error;
  }
};

const getTotalOrdersByStatus = async (status) => {
  try {
    const totalOrders = await Order.countDocuments({ status });
    return totalOrders;
  } catch (error) {
    throw error;
  }
};

export const adminService = {
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
