import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import DashboardCharts from "../components/DashboardCharts";

export default function Home() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // PRODUCTS
  const [products, setProducts] = useState([]);

  // FORM
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category_id: "",
  });

  // EDIT
  const [editingId, setEditingId] = useState(null);

  // IMAGE
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // SEARCH + PAGINATION
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // CATEGORIES
  const [categories, setCategories] = useState([]);

  // TRASH MODE
  const [showTrash, setShowTrash] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalTrash, setTotalTrash] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [trashCount, setTrashCount] = useState(0);

  // PROTECT ROUTE
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token]);

  //FETCH DASHBOARD
  const getDashboard = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://127.0.0.1:8000/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    getDashboard();
  }, []); 

  // FETCH PRODUCTS
  const getProducts = async () => {
    setLoading(true);
    try {
      setShowTrash(false);

      const res = await axios.get(
        `http://127.0.0.1:8000/api/products?page=${page}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProducts(res.data.data);

      setLastPage(res.data.last_page);

      setTotalProducts(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // LOAD PRODUCTS
  useEffect(() => {
    getProducts();
  }, [search, page]);

  // HANDLE INPUT
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // HANDLE FILE
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    setImage(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // SAVE PRODUCT
  const saveProduct = async () => {
    try {
      const data = new FormData();

      data.append("name", form.name);
      data.append("price", form.price);
      data.append("description", form.description);
      data.append("category_id", form.category_id);

      if (image) {
        data.append("image", image);
      }

      // UPDATE
      if (editingId) {
        data.append("_method", "PUT");

        await axios.post(
          `http://127.0.0.1:8000/api/products/${editingId}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        toast.success("Product updated successfully");
      }

      // CREATE
      else {
        await axios.post("http://127.0.0.1:8000/api/products", data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        toast.success("Product added successfully");
      }

      // RESET FORM
      setForm({
        name: "",
        price: "",
        description: "",
        category_id: "",
      });

      setImage(null);
      setPreview(null);
      setEditingId(null);

      getProducts();
    } catch (err) {
      console.log(err.response.data);

      const errors = err.response.data.errors;

      if (errors?.name) {
        toast.error(errors.name[0]);
      }

      if (errors?.price) {
        toast.error(errors.price[0]);
      }

      if (errors?.description) {
        toast.error(errors.description[0]);
      }

      if (errors?.image) {
        toast.error(errors.image[0]);
      }
    }
  };

  // EDIT
  const handleEdit = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name,
      price: product.price,
      description: product.description,
      category_id: product.category_id,
    });

    if (product.image) {
      setPreview(`http://127.0.0.1:8000/storage/${product.image}`);
    }

    setImage(null);
  };

  // DELETE
  const deleteProduct = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.error("Product moved to trash");

      getProducts();
    } catch (err) {
      console.log(err.response.data);
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");

    navigate("/");
  };

  // FETCH CATEGORIES
  const getCategories = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/categories");

      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  // TRASH PRODUCTS
  const getTrashProducts = async () => {
    try {
      setShowTrash(true);

      const res = await axios.get("http://127.0.0.1:8000/api/products-trash", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // RESTORE
  const restoreProduct = async (id) => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/products-restore/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Product restored");

      getTrashProducts();
    } catch (err) {
      console.error(err);
    }
  };

  // FORCE DELETE
  const forceDeleteProduct = async (id) => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/products-force-delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Permanently deleted");

      getTrashProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const getDashboardStats = async () => {
    try {
      // categories
      const catRes = await axios.get("http://127.0.0.1:8000/api/categories");

      setTotalCategories(catRes.data.length);

      // trash count
      const trashRes = await axios.get(
        "http://127.0.0.1:8000/api/products-trash-count",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTotalTrash(trashRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getDashboardStats();
  }, []);

  const getTrashCount = async () => {
  try {

    const res = await axios.get(
      "http://127.0.0.1:8000/api/products-trash",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setTrashCount(res.data.length);

  } catch (err) {
    console.log(err);
  }
};

  useEffect(() => {
    getTrashCount();
  }, []);

  return (
    <div
      className={`min-h-screen flex transition-all duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* SIDEBAR */}
      <div
        className={`w-64 shadow-xl p-6 hidden md:block transition-all duration-300 ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        }`}
      >
        <h2 className="text-3xl font-bold text-pink-500 mb-10">BlueBell 🎂</h2>

        <ul className="space-y-4">
          <li>
            <button
              onClick={getDashboard}
              className="w-full text-left bg-orange-700 text-white px-4 py-3 rounded-xl hover:bg--800 transition"
            >
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={getProducts}
              className="w-full text-left bg-gray-700 text-white px-4 py-3 rounded-xl hover:bg-gray-800 transition"
            >
              Products
            </button>
          </li>

          <li>
            <button
              onClick={getTrashProducts}
              className="w-full flex justify-between items-center bg-yellow-500 text-white px-4 py-3 rounded-xl hover:bg-yellow-600 transition"
            >
              <span>Trash</span>

              <span className="bg-white text-yellow-600 px-2 py-1 rounded-full text-sm font-bold">
                {trashCount}
              </span>
            </button>
          </li>

          <li>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full text-left bg-gray-600 text-white px-4 py-3 rounded-xl hover:bg-gray-700 transition"
            >
              {darkMode ? "Light Mode ☀️" : "Dark Mode 🌙"}
            </button>
          </li>

          <li>
            <button
              onClick={logout}
              className="w-full text-left bg-red-500 text-white px-4 py-3 rounded-xl hover:bg-red-600 transition"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-pink-500">
            Blue Bell Bakes 🎂
          </h1>

          <p className="text-gray-500 mt-2">Product Management Dashboard</p>
        </div>

        {/* CHARTS */}
        <DashboardCharts
          products={products}
          categories={categories}
          darkMode={darkMode}
        />

        {/* SEARCH */}
        <div
          className={`p-6 rounded-2xl shadow-lg mb-8 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full p-4 rounded-xl border outline-none ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300"
            }`}
          />
        </div>

        {/* FORM */}
        <div
          className={`p-6 rounded-2xl shadow-lg mb-10 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-2xl font-bold mb-6">
            {editingId ? "Update Product" : "Add Product"}
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveProduct();
            }}
            className="space-y-5"
          >
            {/* IMAGE */}
            <input type="file" onChange={handleFileChange} className="w-full" />

            {/* PREVIEW */}
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="w-40 h-40 object-cover rounded-xl"
              />
            )}

            {/* CATEGORY */}
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className={`w-full p-4 rounded-xl border outline-none ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              }`}
            >
              <option value="">Select Category</option>

              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* NAME */}
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={form.name}
              onChange={handleChange}
              className={`w-full p-4 rounded-xl border outline-none ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              }`}
            />

            {/* PRICE */}
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              className={`w-full p-4 rounded-xl border outline-none ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              }`}
            />

            {/* DESCRIPTION */}
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className={`w-full p-4 rounded-xl border outline-none ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              }`}
            />

            {/* BUTTON */}
            <button
              type="submit"
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl transition"
            >
              {editingId ? "Update Product" : "Add Product"}
            </button>
          </form>
        </div>

        {/* PRODUCTS */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>

              <p className="mt-4 text-lg">Loading products...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className={`rounded-2xl shadow-lg overflow-hidden transition hover:scale-[1.02] ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                {/* IMAGE */}
                {p.image && (
                  <img
                    src={`http://127.0.0.1:8000/storage/${p.image}`}
                    alt={p.name}
                    className="w-full h-52 object-cover"
                  />
                )}

                {/* BODY */}
                <div className="p-5">
                  <p className="text-sm text-gray-500 mb-2">
                    {p.category?.name}
                  </p>

                  <h3 className="text-2xl font-bold mb-2">{p.name}</h3>

                  <p className="text-gray-500 mb-4">{p.description}</p>

                  <p className="text-pink-500 text-2xl font-bold mb-5">
                    ₹ {p.price}
                  </p>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => setSelectedProduct(p)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                      View
                    </button>
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
