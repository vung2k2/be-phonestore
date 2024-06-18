import jwt from "jsonwebtoken";
import "dotenv/config";

export const generateAccessToken = (payload, expiresIn = "20m") => {
  const options = {
    expiresIn,
  };
  return jwt.sign(
    {
      payload,
    },
    process.env.JWT_ACCESS_KEY,
    options
  );
};

export const generateRefreshToken = (payload, expiresIn = "1y") => {
  const options = {
    expiresIn,
  };
  return jwt.sign(
    {
      payload,
    },
    process.env.JWT_REFRESH_KEY,
    options
  );
};
