import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);
const API = import.meta.env.VITE_API_URL;

export default function Cart() {
  const navigate = useNavigate();
  const customerToken = localStorage.getItem("customer_token");
  const auth = { headers: { Authorization: `Bearer ${customerToken}` } };

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  // ===== PROTECT: must be logged in =====
  useEffect(() => {
    if (!customerToken) {
      toast.info("Please login to view your cart");
      setTimeout(() => navigate("/login"), 1200);
    }
  }, [customerToken]);

  // ===== FETCH CART =====
  const getCart = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/cart`, auth);
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.log(err);
      toast.error("Could not load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerToken) getCart();
  }, []);

  // ===== UPDATE QUANTITY =====
  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return;
    try {
      await axios.put(`${API}/cart/${id}`, { quantity }, auth);
      getCart();
    } catch (err) {
      toast.error("Could not update quantity");
    }
  };

  // ===== REMOVE ITEM =====
  const removeItem = async (id) => {
    try {
      await axios.delete(`${API}/cart/${id}`, auth);
      toast.info("Item removed");
      getCart();
    } catch (err) {
      toast.error("Could not remove item");
    }
  };

  // ===== PLACE ORDER =====
  // const placeOrder = async () => {
  //   setPlacing(true);
  //   try {
  //     await axios.post(`${API}/orders`, {}, auth);
  //     toast.success("Order placed successfully! 🎉");
  //     setTimeout(() => navigate("/my-orders"), 1500);
  //   } catch (err) {
  //     toast.error("Could not place order");
  //   } finally {
  //     setPlacing(false);
  //   }
  // };

  // ===== START PAYMENT (get client secret) =====
  const startPayment = async () => {
    setPlacing(true);
    try {
      const res = await axios.post(`${API}/payment/intent`, {}, auth);
      setClientSecret(res.data.clientSecret);
      setShowPayment(true);
    } catch (err) {
      toast.error("Could not start payment");
    } finally {
      setPlacing(false);
    }
  };

  const imageUrl = (img) => {
    if (!img) return null;
    return img.startsWith("http")
      ? img // Cloudinary URL — use directly
      : `${import.meta.env.VITE_STORAGE_URL}/${img}`; // old local path
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-14 h-14 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-pink-500">
            Blue Bell Bakes 🎂
          </Link>
          <Link to="/" className="text-gray-600 hover:text-pink-500 text-sm">
            ← Continue Shopping
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-gray-500 mb-6">Your cart is empty.</p>
            <Link
              to="/"
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* ITEMS */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4"
                >
                  {item.product?.image ? (
                    <img
                      src={imageUrl(item.product?.image)}
                      alt={item.product?.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-pink-50 rounded-xl flex items-center justify-center text-3xl">
                      🧁
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">
                      {item.product?.name}
                    </h3>
                    <p className="text-pink-500 font-semibold">
                      AED {item.product?.price}
                    </p>
                  </div>

                  {/* QUANTITY */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold"
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* SUBTOTAL */}
                  <div className="text-right w-24">
                    <p className="font-bold text-gray-800">
                      AED {(item.product?.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-600 text-xs mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* SUMMARY */}
            <div className="bg-white rounded-2xl shadow-sm p-6 h-fit">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Order Summary
              </h2>
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Items</span>
                <span>{items.reduce((sum, i) => sum + i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-800 border-t pt-3 mt-3">
                <span>Total</span>
                <span className="text-pink-500">AED {total.toFixed(2)}</span>
              </div>

              {/* <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full mt-6 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold"
              >
                {placing ? "Placing order…" : "Place Order"}
              </button> */}
              {!showPayment ? (
                <button
                  onClick={startPayment}
                  disabled={placing}
                  className="w-full mt-6 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold"
                >
                  {placing ? "Loading…" : "Proceed to Payment"}
                </button>
              ) : (
                <div className="mt-6">
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm
                      clientSecret={clientSecret}
                      total={total}
                      onCancel={() => setShowPayment(false)}
                    />
                  </Elements>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
