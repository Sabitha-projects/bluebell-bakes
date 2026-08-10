import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

const API = import.meta.env.VITE_API_URL;

export default function Home() {
  const navigate = useNavigate();
  const customerToken = localStorage.getItem("customer_token");
  const customerName = localStorage.getItem("customer_name");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [cartCount, setCartCount] = useState(0);

  // ===== FETCH PRODUCTS (public) =====
  const getProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/products?page=${page}&search=${search}&category_id=${selectedCategory}`,
      );
      setProducts(res.data.data);
      setLastPage(res.data.last_page);
    } catch (err) {
      console.log(err);
      toast.error("Could not load products");
    } finally {
      setLoading(false);
    }
  };

  // ===== FETCH CATEGORIES (public) =====
  const getCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ===== FETCH CART COUNT (only if logged in) =====
  const getCartCount = async () => {
    if (!customerToken) return;
    try {
      const res = await axios.get(`${API}/cart`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      setCartCount(res.data.count || 0);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getCategories();
    getCartCount();
  }, []);
  useEffect(() => {
    getProducts();
  }, [page, search, selectedCategory]);

  // ===== ADD TO CART =====
  const addToCart = async (product) => {
    // Not logged in → prompt to login
    if (!customerToken) {
      toast.info("Please login to add items to your cart");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    try {
      await axios.post(
        `${API}/cart`,
        { product_id: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${customerToken}` } },
      );
      toast.success(`${product.name} added to cart`);
      getCartCount();
    } catch (err) {
      toast.error("Could not add to cart");
    }
  };

  const logout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_name");
    toast.info("Logged out");
    setTimeout(() => window.location.reload(), 800);
  };

  const imageUrl = (img) => {
    if (!img) return null;
    return img.startsWith("http")
      ? img // Cloudinary URL — use directly
      : `${import.meta.env.VITE_STORAGE_URL}/${img}`; // old local path
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* ============ HEADER ============ */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center flex-wrap gap-4">
          <Link to="/" className="text-2xl md:text-3xl font-bold text-pink-500">
            Blue Bell Bakes 🎂
          </Link>

          <div className="flex items-center gap-3">
            {customerToken ? (
              <>
                <span className="text-gray-600 text-sm hidden sm:inline">
                  Hi, {customerName || "there"}
                </span>
                <Link
                  to="/cart"
                  className="relative bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl text-sm"
                >
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-white text-pink-600 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/my-orders"
                  className="text-gray-600 hover:text-pink-500 text-sm"
                >
                  My Orders
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-red-500 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-pink-500 text-sm px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl text-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="bg-gradient-to-r from-pink-500 to-pink-400 text-white py-14 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">
            Freshly Baked, Every Day
          </h1>
          <p className="text-pink-50 text-lg">
            Cakes, cupcakes and cookies made with love
          </p>
        </div>
      </section>

      {/* ============ FILTERS ============ */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 min-w-[220px] p-3 rounded-xl border border-gray-300 outline-none focus:border-pink-400"
          />

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="p-3 rounded-xl border border-gray-300 outline-none focus:border-pink-400"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* ============ PRODUCTS ============ */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-14 h-14 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 py-20">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
              >
                {p.image ? (
                  <img
                    src={imageUrl(p.image)}
                    alt={p.name}
                    className="w-full h-52 object-cover"
                  />
                ) : (
                  <div className="w-full h-52 bg-pink-50 flex items-center justify-center text-5xl">
                    🧁
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    {p.category?.name}
                  </p>
                  <h3 className="text-lg font-bold text-gray-800 mt-1">
                    {p.name}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1 flex-1">
                    {p.description}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-pink-500 text-xl font-bold">
                      AED {p.price}
                    </span>
                    <button
                      onClick={() => addToCart(p)}
                      className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl text-sm transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============ PAGINATION ============ */}
        {lastPage > 1 && (
          <div className="flex justify-center items-center gap-3 mt-12">
            <button
              disabled={page === 1}
              onClick={() => {
                setPage(page - 1);
                window.scrollTo(0, 0);
              }}
              className="px-5 py-2 rounded-xl bg-white border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>

            <span className="text-gray-600">
              Page {page} of {lastPage}
            </span>

            <button
              disabled={page === lastPage}
              onClick={() => {
                setPage(page + 1);
                window.scrollTo(0, 0);
              }}
              className="px-5 py-2 rounded-xl bg-white border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ============ FOOTER ============ */}
      <footer className="bg-white border-t mt-16 py-8 text-center text-gray-500 text-sm">
        <p>Blue Bell Bakes 🎂 — Freshly baked in Dubai</p>
      </footer>
    </div>
  );
}
