import Product from "../models/productModel.js";
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

export const adminService = { createProduct, importProductsFromExcel };
