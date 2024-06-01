import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: "dnugiesvk",
  api_key: "996527856432318",
  api_secret: "JjuhaAixc3RMdPLKQwbBMakrc-Q",
});

const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ["jpg, png, jpeg"],
  params: {
    folder: "Phonestore",
  },
});

export const uploadCloud = multer({ storage });
