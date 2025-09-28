import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/auth";
import AuthLayout from "./AuthLayout";
import ThemeToggle from "../common/ThemeToggle";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    if (emailErr || passwordErr) return;

    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      let errorMessage = "Login failed. Please try again.";
      if (err?.message) errorMessage = err.message;
      else if (err?.error) errorMessage = err.error;
      else if (typeof err === "string") errorMessage = err;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // SVG Icons
  const EyeIcon = () => (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
      />
    </svg>
  );

  return (
    <AuthLayout>
      <div className="relative mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-800 dark:shadow-2xl">
        <ThemeToggle position="absolute" />

        {/* Logo + tagline */}
        <div className="mb-2 text-center text-2xl font-bold text-slate-800 dark:text-white">
          DevX360
        </div>
        <div className="mb-6 text-center text-sm text-slate-500 dark:text-slate-300">
          Manage your team's workflow efficiently
        </div>

        {/* Tabs */}
        <div className="mb-6 flex border-b border-slate-200 dark:border-slate-600">
          <button className="flex-1 border-b-2 border-indigo-500 pb-2 text-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="flex-1 pb-2 text-center text-sm font-medium text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
                if (error) setError("");
              }}
              placeholder="you@example.com"
              required
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                  if (error) setError("");
                }}
                placeholder="••••••••"
                required
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">{passwordError}</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 p-2 text-center text-sm text-red-600 dark:border-red-500 dark:bg-red-900/10 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-indigo-400 dark:focus:ring-indigo-400"
              />
              Remember me
            </label>
            <a
              href="#"
              className="text-indigo-600 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-300 dark:border-slate-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                or continue with
              </span>
            </div>
          </div>

          {/* Social login */}
          <button
            type="button"
            onClick={() =>
              (window.location.href = `${
                process.env.REACT_APP_API_URL || "http://localhost:5500"
              }/api/auth/github`)
            }
            className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
              alt="GitHub"
              className="h-5 w-5 dark:invert"
            />
            Continue with GitHub
          </button>

          {/* Footer */}
          <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-indigo-600 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Sign up
            </a>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default Login;