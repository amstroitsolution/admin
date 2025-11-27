import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
  FiArrowRight,
} from "react-icons/fi";
import yashperLogo from "../assets/yashper.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [particles, setParticles] = useState([]);

  const nav = useNavigate();

  // ✅ environment variables (safe fallback)
  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const ALLOWED_EMAIL =
    import.meta.env.VITE_ADMIN_EMAIL || "rajanpbh03@gmail.com";

  // 🌌 Animated floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
    }));
    setParticles(newParticles);
  }, []);

  // 🧠 Handle Login
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (email.trim().toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
      setError("❌ Unauthorized email. Access denied.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // 🧩 Store token + user info
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_info", JSON.stringify(data.admin));
      setLoading(false);

      // 🧭 Redirect
      nav("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Network error");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-[4vw]">
      {/* 🔮 Background Orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[clamp(20rem,40vw,31.25rem)] h-[clamp(20rem,40vw,31.25rem)] bg-gradient-to-r from-red-600/20 via-amber-500/15 to-red-700/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-[clamp(15rem,30vw,25rem)] h-[clamp(15rem,30vw,25rem)] bg-gradient-to-r from-amber-600/20 via-red-500/15 to-amber-700/20 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* ✨ Floating particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-gradient-to-r from-amber-400 via-red-500 to-amber-600 rounded-full opacity-40"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              boxShadow: "0 0 10px rgba(245, 158, 11, 0.3)",
            }}
            animate={{
              y: [0, -120, 0],
              opacity: [0, 0.8, 0],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* ⚙️ Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[40vw] xl:max-w-[35vw]"
      >
        <div className="bg-white/10 backdrop-blur-2xl rounded-[2rem] p-[2rem] border border-white/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] relative overflow-hidden">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-5 shadow-[0_20px_40px_-12px_rgba(220,38,38,0.4)] overflow-hidden">
              <img 
                src={yashperLogo} 
                alt="Yashper Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              Yashper Admin
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-amber-500 mx-auto mt-3 rounded-full"></div>
          </div>

          {/* 🔑 Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-white/90 uppercase mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-bold text-white/90 uppercase mb-2">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 pr-12 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-white/60 hover:text-amber-400 transition"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 text-red-200 text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 via-red-700 to-amber-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In <FiArrowRight />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="text-white/60 text-sm text-center mt-6">
            Protected by enterprise-grade security 🔐
          </p>
        </div>
      </motion.div>
    </div>
  );
}
