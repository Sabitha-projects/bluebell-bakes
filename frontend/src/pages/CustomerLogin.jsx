import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

const API = import.meta.env.VITE_API_URL;

export default function CustomerLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/login`, form);

      localStorage.setItem("customer_token", res.data.token);
      localStorage.setItem("customer_name", res.data.user?.name || "");

      toast.success("Welcome back! 🎂");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 422) {
        toast.error("Invalid email or password");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const input =
    "w-full p-3 rounded-xl border border-gray-300 outline-none focus:border-pink-400";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={2500} />

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-pink-500 mb-1">Blue Bell Bakes 🎂</h1>
        <p className="text-gray-500 mb-6">Login to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" name="email" placeholder="Email"
            value={form.email} onChange={handleChange} className={input} required
          />
          <input
            type="password" name="password" placeholder="Password"
            value={form.password} onChange={handleChange} className={input} required
          />

          <button
            type="submit" disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-pink-500 font-semibold hover:underline">
            Register
          </Link>
        </p>

        <p className="text-center mt-3 text-sm">
          <Link to="/" className="text-gray-400 hover:underline">← Back to shop</Link>
        </p>
      </div>
    </div>
  );
}