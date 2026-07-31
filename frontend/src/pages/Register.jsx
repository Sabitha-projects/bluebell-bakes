import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

const API = import.meta.env.VITE_API_URL;

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // simple front-end check that passwords match
    if (form.password !== form.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/register`, form);

      // if the backend returns a token, log the user in immediately
      if (res.data.token) {
        localStorage.setItem("customer_token", res.data.token);
        localStorage.setItem("customer_name", res.data.user?.name || form.name);
        toast.success("Account created! Welcome 🎂");
        setTimeout(() => navigate("/"), 1200);
      } else {
        // otherwise send them to login
        toast.success("Account created! Please log in.");
        setTimeout(() => navigate("/login"), 1200);
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach((msg) => toast.error(msg[0]));
      } else {
        toast.error("Registration failed. Please try again.");
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
        <p className="text-gray-500 mb-6">Create your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className={input}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className={input}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className={input}
            required
          />
          <input
            type="password"
            name="password_confirmation"
            placeholder="Confirm Password"
            value={form.password_confirmation}
            onChange={handleChange}
            className={input}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition"
          >
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-pink-500 font-semibold hover:underline">
            Login
          </Link>
        </p>

        <p className="text-center mt-3 text-sm">
          <Link to="/" className="text-gray-400 hover:underline">← Back to shop</Link>
        </p>
      </div>
    </div>
  );
}