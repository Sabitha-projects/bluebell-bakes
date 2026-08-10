import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import DashboardCharts from "../../components/DashboardCharts";

const API = import.meta.env.VITE_API_URL;

export default function AdminPanel() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  // ===== WHICH SECTION IS SHOWING =====
  const [view, setView] = useState("dashboard");

  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // ===== DATA =====
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [trashProducts, setTrashProducts] = useState([]);
  const [trashCount, setTrashCount] = useState(0);

  // ===== PRODUCT FORM =====
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "", price: "", description: "", category_id: "",
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // ===== CATEGORY FORM =====
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  // ===== SEARCH / PAGINATION =====
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // ===== PROTECT ROUTE =====
  useEffect(() => {
    if (!token) navigate("/admin/login");
  }, [token]);

  // ===== FETCHERS =====
  const getStats = async () => {
    try {
      const res = await axios.get(`${API}/dashboard/stats`, auth);
      setStats(res.data);
    } catch (err) { console.log(err); }
  };

  const getProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/products?page=${page}&search=${search}`, auth);
      setProducts(res.data.data);
      setLastPage(res.data.last_page);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const getCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories`, auth);
      setCategories(res.data);
    } catch (err) { console.log(err); }
  };

  const getOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/orders`, auth);
      setOrders(res.data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const getTrashProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/products-trash`, auth);
      setTrashProducts(res.data);
      setTrashCount(res.data.length);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const getTrashCount = async () => {
    try {
      const res = await axios.get(`${API}/products-trash-count`, auth);
      setTrashCount(res.data);
    } catch (err) { console.log(err); }
  };

  // ===== LOAD DATA WHEN VIEW CHANGES =====
  useEffect(() => {
    getCategories();
    getTrashCount();
  }, []);

  useEffect(() => {
    if (view === "dashboard") { getStats(); getProducts(); }
    if (view === "products") getProducts();
    if (view === "categories") getCategories();
    if (view === "orders") getOrders();
    if (view === "trash") getTrashProducts();
  }, [view, page, search]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  // ===== PRODUCT: SAVE =====
  const saveProduct = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", productForm.name);
      data.append("price", productForm.price);
      data.append("description", productForm.description);
      data.append("category_id", productForm.category_id);
      if (image) data.append("image", image);

      if (editingProductId) {
        data.append("_method", "PUT");
        await axios.post(`${API}/products/${editingProductId}`, data, auth);
        toast.success("Product updated");
      } else {
        await axios.post(`${API}/products`, data, auth);
        toast.success("Product added");
      }

      resetProductForm();
      getProducts();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).forEach((msg) => toast.error(msg[0]));
      else toast.error("Something went wrong");
    }
  };

  const resetProductForm = () => {
    setProductForm({ name: "", price: "", description: "", category_id: "" });
    setImage(null);
    setPreview(null);
    setEditingProductId(null);
    setShowProductForm(false);
  };

  const editProduct = (p) => {
    setEditingProductId(p.id);
    setProductForm({
      name: p.name, price: p.price,
      description: p.description, category_id: p.category_id,
    });
    if (p.image) setPreview(p.image.startsWith('http') ? p.image : `${import.meta.env.VITE_STORAGE_URL}/${p.image}`);
    setImage(null);
    setShowProductForm(true);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Move this product to trash?")) return;
    try {
      await axios.delete(`${API}/products/${id}`, auth);
      toast.info("Product moved to trash");
      getProducts();
      getTrashCount();
    } catch (err) { toast.error("Delete failed"); }
  };

  // ===== TRASH ACTIONS =====
  const restoreProduct = async (id) => {
    try {
      await axios.post(`${API}/products-restore/${id}`, {}, auth);
      toast.success("Product restored");
      getTrashProducts();
    } catch (err) { toast.error("Restore failed"); }
  };

  const forceDeleteProduct = async (id) => {
    if (!window.confirm("Permanently delete this product? This cannot be undone.")) return;
    try {
      await axios.delete(`${API}/products-force-delete/${id}`, auth);
      toast.error("Product permanently deleted");
      getTrashProducts();
    } catch (err) { toast.error("Delete failed"); }
  };

  // ===== CATEGORY: SAVE =====
  const saveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategoryId) {
        await axios.put(`${API}/categories/${editingCategoryId}`, categoryForm, auth);
        toast.success("Category updated");
      } else {
        await axios.post(`${API}/categories`, categoryForm, auth);
        toast.success("Category added");
      }
      resetCategoryForm();
      getCategories();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).forEach((msg) => toast.error(msg[0]));
      else toast.error("Something went wrong");
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "" });
    setEditingCategoryId(null);
    setShowCategoryForm(false);
  };

  const editCategory = (c) => {
    setEditingCategoryId(c.id);
    setCategoryForm({ name: c.name });
    setShowCategoryForm(true);
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axios.delete(`${API}/categories/${id}`, auth);
      toast.info("Category deleted");
      getCategories();
    } catch (err) { toast.error("Delete failed"); }
  };

  // ===== ORDER: UPDATE STATUS =====
  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(`${API}/orders/${id}/status`, { status }, auth);
      toast.success("Status updated");
      getOrders();
    } catch (err) { toast.error("Could not update status"); }
  };

  // ===== IMAGE PREVIEW =====
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  // ===== UI HELPERS =====
  const NavBtn = ({ id, label, badge }) => (
    <button
      onClick={() => setView(id)}
      className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition ${
        view === id
          ? "bg-pink-500 text-white"
          : darkMode ? "bg-gray-700 text-white hover:bg-gray-600"
                     : "bg-gray-100 text-gray-800 hover:bg-gray-200"
      }`}
    >
      <span>{label}</span>
      {badge !== undefined && (
        <span className="bg-white text-pink-600 px-2 py-0.5 rounded-full text-xs font-bold">
          {badge}
        </span>
      )}
    </button>
  );

  const statuses = ["pending", "processing", "completed", "cancelled"];

  const statusColor = (s) => ({
    pending:    "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    completed:  "bg-green-100 text-green-700",
    cancelled:  "bg-red-100 text-red-700",
  }[s] || "bg-gray-100 text-gray-700");

  const card = darkMode ? "bg-gray-800" : "bg-white";
  const input = `w-full p-3 rounded-xl border outline-none ${
    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
  }`;

  const imageUrl = (img) => {
  if (!img) return null;
  return img.startsWith('http')
    ? img                                              // Cloudinary URL — use directly
    : `${import.meta.env.VITE_STORAGE_URL}/${img}`;    // old local path
};

  return (
    <div className={`min-h-screen flex ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <ToastContainer position="top-right" autoClose={2500} />

      {/* ============ SIDEBAR ============ */}
      <aside className={`w-64 p-6 shadow-xl hidden md:block ${card}`}>
        <h2 className="text-3xl font-bold text-pink-500 mb-10">BlueBellBakes</h2>
        <nav className="space-y-3">
          <NavBtn id="dashboard"  label="Dashboard" />
          <NavBtn id="products"   label="Products" />
          <NavBtn id="categories" label="Categories" />
          <NavBtn id="orders"     label="Orders" />
          <NavBtn id="trash"      label="Trash" badge={trashCount} />

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full text-left px-4 py-3 rounded-xl bg-gray-600 text-white hover:bg-gray-700"
          >
            {darkMode ? "Light Mode ☀️" : "Dark Mode 🌙"}
          </button>

          <button
            onClick={logout}
            className="w-full text-left px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* ============ MAIN ============ */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* ---------- DASHBOARD ---------- */}
        {view === "dashboard" && (
          <>
            <h1 className="text-4xl font-bold text-pink-500 mb-8">Dashboard 📊</h1>

            {!stats ? <p>Loading…</p> : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                  <div className={`${card} rounded-2xl shadow-lg p-6`}>
                    <p className="text-gray-500">Total Revenue</p>
                    <h2 className="text-3xl font-bold text-green-600 mt-2">AED {stats.totalRevenue}</h2>
                  </div>
                  <div className={`${card} rounded-2xl shadow-lg p-6`}>
                    <p className="text-gray-500">Total Orders</p>
                    <h2 className="text-3xl font-bold text-blue-600 mt-2">{stats.totalOrders}</h2>
                  </div>
                  <div className={`${card} rounded-2xl shadow-lg p-6`}>
                    <p className="text-gray-500">Total Products</p>
                    <h2 className="text-3xl font-bold text-pink-600 mt-2">{stats.totalProducts}</h2>
                  </div>
                  <div className={`${card} rounded-2xl shadow-lg p-6`}>
                    <p className="text-gray-500">Categories</p>
                    <h2 className="text-3xl font-bold text-yellow-500 mt-2">{stats.totalCategories}</h2>
                  </div>
                </div>

                <DashboardCharts products={products} categories={categories} darkMode={darkMode} />
              </>
            )}
          </>
        )}

        {/* ---------- PRODUCTS ---------- */}
        {view === "products" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-4xl font-bold text-pink-500">Products</h1>
              <button
                onClick={() => { resetProductForm(); setShowProductForm(!showProductForm); }}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl"
              >
                {showProductForm ? "Close" : "+ Add Product"}
              </button>
            </div>

            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className={`${input} mb-6`}
            />

            {showProductForm && (
              <div className={`${card} p-6 rounded-2xl shadow-lg mb-8`}>
                <h2 className="text-2xl font-bold mb-5">
                  {editingProductId ? "Update Product" : "Add Product"}
                </h2>
                <form onSubmit={saveProduct} className="space-y-4">
                  <input type="file" onChange={handleFileChange} className="w-full" />
                  {preview && <img src={preview} alt="preview" className="w-32 h-32 object-cover rounded-xl" />}

                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className={input}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>

                  <input
                    type="text" placeholder="Product Name" value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className={input}
                  />
                  <input
                    type="number" step="0.01" placeholder="Price" value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className={input}
                  />
                  <textarea
                    rows="3" placeholder="Description" value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className={input}
                  />

                  <div className="flex gap-3">
                    <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-xl">
                      {editingProductId ? "Update" : "Save"}
                    </button>
                    <button type="button" onClick={resetProductForm}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2.5 rounded-xl">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? <p>Loading…</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div key={p.id} className={`${card} rounded-2xl shadow-lg overflow-hidden`}>
                    {p.image && (
                      <img src={imageUrl(p.image)} alt={p.name}
                        className="w-full h-44 object-cover" />
                    )}
                    <div className="p-5">
                      <p className="text-sm text-gray-500">{p.category?.name}</p>
                      <h3 className="text-xl font-bold mb-1">{p.name}</h3>
                      <p className="text-gray-500 text-sm mb-3">{p.description}</p>
                      <p className="text-pink-500 text-xl font-bold mb-4">AED {p.price}</p>
                      <div className="flex gap-2">
                        <button onClick={() => editProduct(p)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">Edit</button>
                        <button onClick={() => deleteProduct(p.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {lastPage > 1 && (
              <div className="flex gap-2 mt-8 justify-center">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}
                  className="px-4 py-2 rounded-lg bg-gray-300 disabled:opacity-40">Prev</button>
                <span className="px-4 py-2">Page {page} of {lastPage}</span>
                <button disabled={page === lastPage} onClick={() => setPage(page + 1)}
                  className="px-4 py-2 rounded-lg bg-gray-300 disabled:opacity-40">Next</button>
              </div>
            )}
          </>
        )}

        {/* ---------- CATEGORIES ---------- */}
        {view === "categories" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-4xl font-bold text-pink-500">Categories</h1>
              <button
                onClick={() => { resetCategoryForm(); setShowCategoryForm(!showCategoryForm); }}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl"
              >
                {showCategoryForm ? "Close" : "+ Add Category"}
              </button>
            </div>

            {showCategoryForm && (
              <div className={`${card} p-6 rounded-2xl shadow-lg mb-8`}>
                <h2 className="text-2xl font-bold mb-5">
                  {editingCategoryId ? "Update Category" : "Add Category"}
                </h2>
                <form onSubmit={saveCategory} className="space-y-4">
                  <input
                    type="text" placeholder="Category Name" value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ name: e.target.value })}
                    className={input}
                  />
                  <div className="flex gap-3">
                    <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-xl">
                      {editingCategoryId ? "Update" : "Save"}
                    </button>
                    <button type="button" onClick={resetCategoryForm}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2.5 rounded-xl">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className={`${card} rounded-2xl shadow-lg overflow-hidden`}>
              {categories.length === 0 ? (
                <p className="p-6 text-gray-500">No categories yet.</p>
              ) : categories.map((c) => (
                <div key={c.id} className="flex justify-between items-center p-4 border-b last:border-0">
                  <span className="font-semibold">{c.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => editCategory(c)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">Edit</button>
                    <button onClick={() => deleteCategory(c.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ---------- ORDERS ---------- */}
        {view === "orders" && (
          <>
            <h1 className="text-4xl font-bold text-pink-500 mb-6">Orders</h1>

            {loading ? <p>Loading…</p> : orders.length === 0 ? (
              <p className="text-gray-500">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className={`${card} rounded-2xl shadow-lg p-5`}>
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <h3 className="text-lg font-bold">Order #{o.id}</h3>
                        <p className="text-gray-500 text-sm">
                          {o.user?.name || "Customer"} {o.user?.email && `· ${o.user.email}`}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {o.created_at && new Date(o.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-green-600 font-bold text-xl">AED {o.total_price}</p>
                        <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${statusColor(o.status)}`}>
                          {o.status}
                        </span>
                      </div>
                    </div>

                    {o.items?.length > 0 && (
                      <div className="mt-4 pt-4 border-t space-y-1">
                        {o.items.map((it) => (
                          <div key={it.id} className="flex justify-between text-sm text-gray-500">
                            <span>{it.product?.name} × {it.quantity}</span>
                            <span>AED {it.price}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-3">
                      <label className="text-sm text-gray-500">Update status:</label>
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        className={`p-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                      >
                        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ---------- TRASH ---------- */}
        {view === "trash" && (
          <>
            <h1 className="text-4xl font-bold text-pink-500 mb-6">Trash 🗑️</h1>

            {loading ? <p>Loading…</p> : trashProducts.length === 0 ? (
              <p className="text-gray-500">Trash is empty.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {trashProducts.map((p) => (
                  <div key={p.id} className={`${card} rounded-2xl shadow-lg p-5 opacity-80`}>
                    <p className="text-sm text-gray-500">{p.category?.name}</p>
                    <h3 className="text-xl font-bold mb-1">{p.name}</h3>
                    <p className="text-pink-500 text-lg font-bold mb-4">AED {p.price}</p>
                    <div className="flex gap-2">
                      <button onClick={() => restoreProduct(p.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">Restore</button>
                      <button onClick={() => forceDeleteProduct(p.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">Delete Forever</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}