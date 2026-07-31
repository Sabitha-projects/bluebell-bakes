import axios from "axios";
import { useState } from "react";

export default function CartPanel({
  cart,
  total,
  removeFromCart,
  updateQuantity,
  setCart,
}) {

  const token = localStorage.getItem("token");

  const [customerName, setCustomerName] =
    useState("");

  const [loading, setLoading] = useState(false);

  // PLACE ORDER
  const placeOrder = async () => {

    if (cart.length === 0) {

      alert("Cart is empty");

      return;
    }

    if (!customerName) {

      alert("Enter customer name");

      return;
    }

    try {

      setLoading(true);

      // PREPARE ITEMS
      const items = cart.map((item) => ({

        product_id: item.id,

        quantity: item.quantity,
      }));

      // API CALL
      await axios.post(
        `${import.meta.env.VITE_API_URL}/orders`,

        {
          customer_name: customerName,

          items: items,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Order placed successfully");

      // CLEAR CART
      setCart([]);

      setCustomerName("");

    } catch (err) {

      console.log(err.response.data);

      alert("Something went wrong");
    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="w-96 bg-white shadow-lg p-6 overflow-y-auto">

      <h2 className="text-3xl font-bold text-pink-500 mb-6">
        Cart 🛒
      </h2>

      {/* CUSTOMER */}
      <input
        type="text"
        placeholder="Customer Name"
        value={customerName}
        onChange={(e) =>
          setCustomerName(e.target.value)
        }
        className="w-full border rounded-xl p-3 mb-6"
      />

      {/* CART ITEMS */}
      <div className="space-y-4">

        {cart.map((item) => (

          <div
            key={item.id}
            className="border rounded-xl p-4"
          >

            <h3 className="font-bold text-lg">
              {item.name}
            </h3>

            <p className="text-pink-500 font-bold">
              ₹ {item.price}
            </p>

            {/* QUANTITY */}
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) =>
                updateQuantity(
                  item.id,
                  Number(e.target.value)
                )
              }
              className="w-full border rounded-xl p-2 mt-3"
            />

            {/* SUBTOTAL */}
            <p className="mt-3 font-bold">
              ₹ {item.price * item.quantity}
            </p>

            {/* REMOVE */}
            <button
              onClick={() =>
                removeFromCart(item.id)
              }
              className="mt-3 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
            >
              Remove
            </button>

          </div>
        ))}

      </div>

      {/* TOTAL */}
      <div className="mt-8 border-t pt-6">

        <h3 className="text-3xl font-bold text-green-600">
          Total: ₹ {total}
        </h3>

        {/* PLACE ORDER */}
        <button
          onClick={placeOrder}
          disabled={loading}
          className="w-full mt-6 bg-pink-500 text-white py-4 rounded-xl hover:bg-pink-600 disabled:bg-gray-400"
        >
          {loading
            ? "Processing..."
            : "Place Order"}
        </button>

      </div>
    </div>
  );
}