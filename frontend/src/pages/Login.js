import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await loginApi({ email, password });
      login(res.data);
      navigate(res.data.role === "admin" ? "/" : "/coach-portal");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <p className="text-5xl mb-2">⚽</p>
          <h1 className="text-2xl font-bold text-green-700">Soccer Academy</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded p-3 mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Email</label>
            <input
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              type="email"
              placeholder="you@academy.lk"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Password</label>
            <input
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required />
          </div>
          <button
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
            type="submit"
            disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-6 bg-gray-50 rounded p-3 text-xs text-gray-400">
          <p><strong>Admin:</strong> admin@academy.lk / admin123</p>
          <p><strong>Coach:</strong> their email / coach123</p>
        </div>
      </div>
    </div>
  );
}