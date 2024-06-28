"use client";

import { CurrencyRupeeIcon } from "@heroicons/react/24/solid";
import SpinnerMini from "./SpinnerMini";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentButton({ bookingId, amount, user }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handlePayment() {
    setIsLoading(true);
    const data = await fetch(`/api/payment/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: parseFloat(amount) * 100,
      }),
    });

    if (!data.ok) {
      throw new Error("Network response was not ok");
    }

    const { order } = await data?.json();
    const options = {
      key: process.env.RAZORPAY_KEY_ID,
      name: user?.email,
      currency: order.currency,
      order_id: order.id,
      modal: {
        ondismiss: function () {
          setIsLoading(false);
        },
      },

      handler: async function (response) {
        const data = await fetch("/api/payment/verify", {
          method: "POST",
          body: JSON.stringify({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            email: user?.email,
            bookingId: bookingId,
          }),
        });

        if (res?.error === false) {
          router.refresh();
        }
        setIsLoading(false);
      },
      prefill: {
        email: user?.email,
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();

    paymentObject.on("payment.failed", function (response) {
      alert("Payment failed. Please try again.");
      setIsLoading(false);
    });
  }

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="group flex items-center gap-2 uppercase text-xs font-bold text-primary-300 flex-grow px-3 hover:bg-accent-600 transition-colors hover:text-primary-900 border-t border-primary-800"
    >
      {!isLoading ? (
        <>
          <CurrencyRupeeIcon className="h-[20px] w-[20px] text-primary-600 group-hover:text-primary-800 transition-colors" />
          <span className="mt-1">Pay</span>
        </>
      ) : (
        <span className="mx-auto">
          <SpinnerMini />
        </span>
      )}
    </button>
  );
}
