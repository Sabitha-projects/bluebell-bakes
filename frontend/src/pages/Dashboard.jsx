import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";   // ← added for logout/navigation
import axios from "axios";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();          // ← added
  const [stats, setStats] = useState(null);

  // FETCH STATS
  const getStats = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getStats();
  }, []);

  // LOGOUT  ← added
  const handleLogout = () => {
    localStorage.removeItem("token");   // clear the saved token
    navigate("/admin/login");           // send back to admin login
  };

  if (!stats) {
    return <div className="p-10">Loading...</div>;
  }

  // CHART DATA
  const chartData = {
    labels: ["Revenue", "Orders", "Products", "Categories"],
    datasets: [
      {
        label: "Dashboard Stats",
        data: [
          stats.totalRevenue,
          stats.totalOrders,
          stats.totalProducts,
          stats.totalCategories,
        ],
        backgroundColor: ["#ec4899", "#3b82f6", "#10b981", "#f59e0b"],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* HEADER ROW: title + action buttons  ← updated */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-pink-500">Dashboard 📊</h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/admin/products/add")}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-xl shadow"
          >
            + Add Product
          </button>

          <button
            onClick={() => navigate("/admin/categories/add")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow"
          >
            + Add Category
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl shadow"
          >
            Logout
          </button>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-gray-500">Total Revenue</p>
          <h2 className="text-4xl font-bold text-green-600 mt-2">₹ {stats.totalRevenue}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-gray-500">Total Orders</p>
          <h2 className="text-4xl font-bold text-blue-600 mt-2">{stats.totalOrders}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-gray-500">Total Products</p>
          <h2 className="text-4xl font-bold text-pink-600 mt-2">{stats.totalProducts}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-gray-500">Categories</p>
          <h2 className="text-4xl font-bold text-yellow-500 mt-2">{stats.totalCategories}</h2>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">
        <h2 className="text-2xl font-bold mb-6">Analytics Chart</h2>
        <Bar data={chartData} />
      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
        <div className="space-y-4">
          {stats.recentOrders.map((order) => (
            <div key={order.id} className="border rounded-xl p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{order.customer_name}</h3>
                <p className="text-gray-500">Order #{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-green-600 font-bold text-xl">₹ {order.total_price}</p>
                <p className="text-gray-500">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}