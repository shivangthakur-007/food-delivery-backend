// import orderModel from "../models/order.model.js";
// import userModel from "../models/userModel.js";
// import Razorpay from "razorpay";
// import crypto from "crypto"

// // const Razorpay = new razorpay(process.env.RAZORPAY_SECRET_KEY, process.env.RAZORPAY_SECRET_ID);

// // Initialize Razorpay instance
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_SECRET_ID,
//   key_secret: process.env.RAZORPAY_SECRET_KEY,
// });

// //placing user order for frontend
// const placeOrder = async (req, res) => {
//   const frontend_url = "http://localhost:5173";
//   try {
//     const newOrder = new orderModel({
//       userId: req.body.userId,
//       items: req.body.items,
//       amount: req.body.amount,
//       address: req.body.address,
//     });
//     await newOrder.save();

//     await userModel.findByIdAndUpdate(req.body.id, { cartData: {} });

//     // const line_items = req.body.items.map((item) => ({
//     //   price_data: {
//     //     currency: "INR",
//     //     product_data: {
//     //       name: item.name,
//     //     },
//     //     unit_amount: item.price * 100 * 80,
//     //   },
//     //   quantity: item.quantity,
//     // }));
//     // line_items.push({
//     //   price_data: {
//     //     currency: "inr",
//     //     product_data: {
//     //       name: "Delivery Charges",
//     //     },
//     //     unit_amount: 2 * 100 * 80,
//     //   },
//     //   quantity: 1,
//     // });

//     const totalAmount =
//       req.body.items.reduce(
//         (acc, item) => acc + item.price * item.quantity,
//         0
//       ) + 200; // Adding delivery charges (200 paisa)

//     const session = await razorpay.orders.create({
//       // line_items: line_items,
//       // mode: "payment",
//       // success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
//       // cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
//       amount: totalAmount * 100,
//       currency: "INR",
//       receipt: `order_${newOrder._id}`,
//     });
//     res.json({
//       success: true,
//       orderId: newOrder._id,
//       razorpayOrderId: razorpayOrder.id,
//       amount: totalAmount,
//       currency: "INR",
//     });
//   } catch (e) {
//     console.log(e);
//     res.json({ success: false, message: e.message });
//   }
// };

// const verifyOrder = async (req, res) => {
//   // const { orderId, success } = req.body;
//   const { razorpayPaymentId, razorpayOrderId, razorpaySignature, orderId } =
//     req.body;
//   try {
//     // Verify Razorpay signature to ensure the payment is legitimate
//     const body = razorpayOrderId + "|" + razorpayPaymentId;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
//       .update(body)
//       .digest("hex");

//     if (expectedSignature !== razorpaySignature) {
//       // Signature mismatch, reject the payment
//       await orderModel.findByIdAndDelete(orderId); // Delete the unpaid order
//       return res.json({
//         success: false,
//         message: "Payment verification failed",
//       });
//     }

//     // Signature matched, update the payment status
//     await orderModel.findByIdAndUpdate(orderId, { payment: true });
//     res.json({ success: true, message: "Payment verified and order updated" });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// export { placeOrder, verifyOrder };

import orderModel from "../models/order.model.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_SECRET_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173";
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();

    await userModel.findByIdAndUpdate(req.body.id, { cartData: {} });

    const totalAmount =
      req.body.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      ) + 200;

    const session = await razorpay.orders.create({
      amount: totalAmount * 100, // Convert to paisa
      currency: "INR",
      receipt: `order_${newOrder._id}`,
      // success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      // cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({
      success: true,
      orderId: newOrder._id,
      razorpayOrderId: session.id,
      amount: totalAmount,
      currency: "INR",
    });
  } catch (e) {
    console.log(e);
    res.json({ success: false, message: e.message });
  }
};

const verifyOrder = async (req, res) => {
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature, orderId } =
    req.body;

  try {
    // Verify Razorpay signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      // Signature mismatch, reject the payment
      await orderModel.findByIdAndDelete(orderId); // Delete the unpaid order
      return res.json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Signature matched, update payment status
    await orderModel.findByIdAndUpdate(orderId, { payment: true });
    res.json({ success: true, message: "Payment verified and order updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: e.message });
  }
};

//listing orders for admin panel
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: e.message });
  }
};

// api for updating order status
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {status: req.body.status})
    res.json({success: true, message: "Status Updated"})
  } catch (error) {
    console.log(error);
    res.json({success: false, message: error.message})
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
