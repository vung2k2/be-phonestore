import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalAmount: { type: Number, required: true },
  provider: {
    type: String,
    enum: ["vnpay", "on_delivery"],
    required: true,
  },
  status: {
    type: String,
    enum: ["completed", "cancelled", "pending"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  orderInfo: { type: String, maxlength: 1000 },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
    },
  ],
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
