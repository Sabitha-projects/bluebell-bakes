import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";

import bakeryBg from "../../assets/bluebellbakes-admin.jpg";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [remember, setRemember] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const login = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        form,
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      if (remember) {
        localStorage.setItem("remember_email", form.email);
      } else {
        localStorage.removeItem("remember_email");
      }

      toast.success("Welcome back!");

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />

      <div
        className="min-h-screen bg-cover bg-center flex items-center justify-center relative"
        style={{
          backgroundImage: `url(${bakeryBg})`,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Card */}
        <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-5xl">🎂</h1>

            <h2 className="text-3xl font-bold text-pink-600 mt-2">
              BlueBell Bakes
            </h2>

            <p className="text-gray-600 mt-1">Admin Portal</p>

            <p className="text-gray-500 text-sm mt-2">
              Welcome back! Sign in to continue.
            </p>
          </div>

          <form onSubmit={login} className="space-y-5">
            {/* Email */}

            <div>
              <label className="text-sm font-medium">Email Address</label>

              <div className="relative mt-2">
                <FaEnvelope className="absolute left-4 top-4 text-pink-500" />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
            </div>

            {/* Password */}

            <div>
              <label className="text-sm font-medium">Password</label>

              <div className="relative mt-2">
                <FaLock className="absolute left-4 top-4 text-pink-500" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Remember */}

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                />
                Remember Me
              </label>
            </div>

            {/* Button */}

            <button
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 transition duration-300 text-white py-3 rounded-xl font-semibold shadow-lg"
            >
              {loading ? "Logging in..." : "Login to Dashboard"}
            </button>
          </form>

          {/* Divider */}

          <div className="my-6 border-t"></div>

          {/* Back */}

          <div className="text-center">
            <Link to="/" className="text-pink-600 hover:underline">
              ← Back to Store
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
