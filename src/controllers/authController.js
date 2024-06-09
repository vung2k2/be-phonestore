import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import { authService } from "../services/authService.js";
import { emailValidation } from "../validations/emailValidation.js";

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Thiếu thông tin đăng ký!");
    if (!emailValidation(email))
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Định dạng email không hợp lệ!"
      );
    const user = await authService.register(name, email, password);
    res.status(StatusCodes.CREATED).json(user);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Thiếu thông tin đăng nhập!");
    if (!emailValidation(email))
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Định dạng email không hợp lệ!"
      );
    const result = await authService.login(email, password);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.headers.refreshtoken;
    if (!refreshToken) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Không tìm thấy refreshToken!"
      );
    }
    const newTokens = await authService.refreshToken(refreshToken);
    res.status(StatusCodes.OK).json(newTokens);
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(StatusCodes.OK).json(result);
    next();
  } catch (error) {
    next(error);
  }
};

const rePassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Vui lòng điền đầy đủ thông tin"
      );
    } else {
      const result = await authService.rePassword(token, newPassword);
      res.status(StatusCodes.OK).json(result);
      next();
    }
  } catch (error) {
    next(error);
  }
};

export const authController = {
  register,
  login,
  refreshToken,
  forgotPassword,
  rePassword,
};
