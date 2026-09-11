import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const Login = () => {
  const { login, user, isLoggingIn, loginError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      await login({
        identifier: data.username,
        password: data.password,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (user) {
    if (user.role === "CASHIER") return <Navigate to="/pos" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* ---------------- LEFT PANEL (Branding) ---------------- */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-emerald-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-yellow-300/20 rounded-full blur-2xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              YourBrand POS
            </span>
          </div>

          {/* Hero copy */}
          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
              Welcome back to your dashboard.
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Manage your products, track sales, and grow your business faster
              with our powerful POS system.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div>
                <div className="text-3xl font-bold">10k+</div>
                <div className="text-xs text-white/70 mt-1 uppercase tracking-wider font-semibold">
                  Active users
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">99.9%</div>
                <div className="text-xs text-white/70 mt-1 uppercase tracking-wider font-semibold">
                  Uptime
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-xs text-white/70 mt-1 uppercase tracking-wider font-semibold">
                  Support
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-white/60 font-medium">
            © {new Date().getFullYear()} YourBrand POS. All rights reserved.
          </div>
        </div>
      </div>

      {/* ---------------- RIGHT PANEL (Form) ---------------- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              YourBrand POS
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Sign in
            </h2>
            <p className="mt-2 text-gray-500">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Error alert */}
          {loginError && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-800">Login failed</h3>
                <p className="text-sm text-red-700 mt-0.5">
                  {loginError.message || "Invalid username or password"}
                </p>
              </div>
            </div>
          )}

          {/* Form card */}
          <div className="bg-white rounded-xl card-shadow border border-gray-100 p-6 sm:p-8">
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-modern" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Enter your username"
                    {...register("username")}
                    className={`block w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 shadow-sm transition-modern outline-none ${
                      errors.username
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : "border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    }`}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-modern"
                  >
                    Forgot?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-modern" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    {...register("password")}
                    className={`block w-full rounded-xl border bg-white py-3 pl-11 pr-11 text-gray-900 placeholder:text-gray-400 shadow-sm transition-modern outline-none ${
                      errors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : "border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-modern"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-600 cursor-pointer select-none"
                >
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-indigo-600 py-3 px-4 text-sm font-bold text-white shadow-md shadow-indigo-500/30 transition-modern hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-gray-400">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              SSL Secured
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Lock className="w-4 h-4 text-emerald-500" />
              Encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
