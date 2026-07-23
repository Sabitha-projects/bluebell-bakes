import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function DashboardCharts({
  products,
  categories,
  darkMode,
}) {

  // BAR CHART DATA
  const barData = {
    labels: products.map((p) => p.name),

    datasets: [
      {
        label: "Product Prices",

        data: products.map((p) => p.price),

        backgroundColor: [
          "#ec4899",
          "#3b82f6",
          "#10b981",
          "#f59e0b",
          "#8b5cf6",
        ],

        borderRadius: 10,
      },
    ],
  };

  // CATEGORY COUNTS
  const categoryCounts = categories.map((cat) => {
    return products.filter(
      (p) => p.category_id === cat.id
    ).length;
  });

  // DOUGHNUT DATA
  const doughnutData = {
    labels: categories.map((c) => c.name),

    datasets: [
      {
        data: categoryCounts,

        backgroundColor: [
          "#ec4899",
          "#3b82f6",
          "#10b981",
          "#f59e0b",
          "#8b5cf6",
        ],

        borderWidth: 2,
      },
    ],
  };

  // TOTAL VALUE
  const totalValue = products.reduce(
    (sum, item) => sum + Number(item.price),
    0
  );

  return (
    <div className="mb-10">

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* TOTAL PRODUCTS */}
        <div
          className={`rounded-2xl p-6 shadow-lg transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 text-white"
              : "bg-white"
          }`}
        >
          <h2 className="text-4xl font-bold text-pink-500">
            {products.length}
          </h2>

          <p className="mt-2 text-gray-500">
            Total Products
          </p>
        </div>

        {/* TOTAL CATEGORIES */}
        <div
          className={`rounded-2xl p-6 shadow-lg transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 text-white"
              : "bg-white"
          }`}
        >
          <h2 className="text-4xl font-bold text-blue-500">
            {categories.length}
          </h2>

          <p className="mt-2 text-gray-500">
            Categories
          </p>
        </div>

        {/* TOTAL VALUE */}
        <div
          className={`rounded-2xl p-6 shadow-lg transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 text-white"
              : "bg-white"
          }`}
        >
          <h2 className="text-4xl font-bold text-green-500">
            ₹ {totalValue}
          </h2>

          <p className="mt-2 text-gray-500">
            Inventory Value
          </p>
        </div>

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* BAR CHART */}
        <div
          className={`rounded-2xl p-6 shadow-lg transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 text-white"
              : "bg-white"
          }`}
        >
          <h2 className="text-2xl font-bold mb-6">
            Product Prices
          </h2>

          <div className="h-72">
            <Bar
              data={barData}
              options={{
                maintainAspectRatio: false,

                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* DOUGHNUT CHART */}
        <div
          className={`rounded-2xl p-6 shadow-lg transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 text-white"
              : "bg-white"
          }`}
        >
          <h2 className="text-2xl font-bold mb-6">
            Category Distribution
          </h2>

          <div className="h-72 flex justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

      </div>

    </div>
  );
}