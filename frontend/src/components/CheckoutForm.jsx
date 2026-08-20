import { useState } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function CheckoutForm({ clientSecret, total, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const customerToken = localStorage.getItem("customer_token");
  const auth = { headers: { Authorization: `Bearer ${customerToken}` } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardNumberElement),
      },
    });

    if (result.error) {
      toast.error(result.error.message || "Payment failed");
      setProcessing(false);
      return;
    }

    if (result.paymentIntent.status === "succeeded") {
      try {
        await axios.post(`${API}/orders`, {}, auth);
        toast.success("Payment successful! Order placed 🎉");
        setTimeout(() => navigate("/my-orders"), 1500);
      } catch (err) {
        toast.error("Payment succeeded but order failed. Contact support.");
        setProcessing(false);
      }
    }
  };

  const elementStyle = {
    style: {
      base: {
        fontSize: "16px",
        color: "#374151",
        "::placeholder": { color: "#9ca3af" },
      },
      invalid: { color: "#ef4444" },
    },
  };

  const boxClass =
    "p-3 border border-gray-300 rounded-xl focus-within:border-pink-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card Number */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Card Number</label>
        <div className={boxClass}>
          <CardNumberElement options={elementStyle} />
        </div>
      </div>

      {/* Expiry + CVC side by side */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Expiry Date</label>
          <div className={boxClass}>
            <CardExpiryElement options={elementStyle} />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">CVC</label>
          <div className={boxClass}>
            <CardCvcElement options={elementStyle} />
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Test card: 4242 4242 4242 4242 · any future date · any CVC
      </p>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold"
        >
          {processing ? "Processing…" : `Pay AED ${total.toFixed(2)}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 bg-gray-300 hover:bg-gray-400 rounded-xl"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}