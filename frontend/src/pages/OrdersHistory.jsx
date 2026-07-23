import { useEffect, useState } from "react";
import axios from "axios";

export default function OrdersHistory() {
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  // FETCH ORDERS
  const getOrders = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-pink-500 mb-8">
          Orders History 📦
        </h1>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                {/* HEADER */}
                <div className="flex justify-between items-center p-6 border-b">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {order.customer_name}
                    </h2>

                    <p className="text-gray-500 mt-1">Order #{order.id}</p>

                    <p className="text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>

                  {/* STATUS */}
                  <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold">
                    {order.status}
                  </span>
                </div>

                {/* ITEMS */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center border rounded-xl p-4"
                      >
                        <div className="flex items-center gap-4">
                          {/* IMAGE */}
                          {item.product?.image && (
                            <img
                              src={`http://127.0.0.1:8000/storage/${item.product.image}`}
                              alt={item.product.name}
                              className="w-20 h-20 object-cover rounded-xl"
                            />
                          )}

                          {/* PRODUCT */}
                          <div>
                            <h3 className="text-xl font-bold">
                              {item.product?.name}
                            </h3>

                            <p className="text-gray-500">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>

                        {/* PRICE */}
                        <div className="text-right">
                          <p className="text-pink-500 text-xl font-bold">
                            ₹ {item.price * item.quantity}
                          </p>

                          <p className="text-gray-500">₹ {item.price} each</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* TOTAL */}
                  <div className="mt-6 border-t pt-6 flex justify-between items-center">
                    <h3 className="text-2xl font-bold">Total Amount</h3>

                    <h3 className="text-3xl font-bold text-green-600">
                      ₹ {order.total_price}
                    </h3>

                    <a
                      href={`http://127.0.0.1:8000/api/orders/${order.id}/invoice`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-pink-500 text-white px-5 py-3 rounded-xl hover:bg-pink-600"
                    >
                      Download Invoice
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
