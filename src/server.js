import express from "express";
import "dotenv/config";
import cors from "cors";
import { API } from "./routes/index.js";
import connectDB from "./config/mongodbConnect.js";
import { errorHandlingMiddleware } from "./middlewares/errorHandlingMiddleware.js";

const app = express();
const port = process.env.PORT || 1406;

connectDB();
const corsOptions = {
  exposedHeaders: ["x-total-count"], // Đảm bảo rằng 'x-total-count' được bao gồm trong các headers hiển thị
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(API);
app.use(errorHandlingMiddleware);

app.get("/", (req, res) => {
  res.send("ok");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
