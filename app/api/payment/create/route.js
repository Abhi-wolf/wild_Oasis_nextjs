import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { v4 as uuid } from "uuid";

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  const { amount } = await request.json();

  // console.log("PAYMENT AMOUNT = ", amount);

  const options = {
    amount: amount.toString(),
    currency: "INR",
    receipt: uuid(),
  };

  const order = await instance.orders.create(options);

  // console.log("ORDER = ", order);

  return NextResponse.json({ message: "success", order });
}
