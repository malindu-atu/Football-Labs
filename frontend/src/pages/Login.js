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
    <div style={{ backgroundColor: "#060D1A", minHeight: "100vh" }}
      className="flex items-center justify-center p-4">

      {/* Background grid effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{
          backgroundImage: "linear-gradient(rgba(0,229,204,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,204,0.03) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} className="w-full h-full" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Glow effect */}
        <div style={{
          background: "radial-gradient(ellipse at center, rgba(0,229,204,0.15) 0%, transparent 70%)",
          width: "400px", height: "400px",
          position: "absolute", top: "-100px", left: "50%",
          transform: "translateX(-50%)", pointerEvents: "none"
        }} />

        {/* Card */}
        <div style={{
          backgroundColor: "#0D1F3C",
          border: "1px solid rgba(0,229,204,0.2)",
          boxShadow: "0 0 40px rgba(0,229,204,0.1)"
        }} className="rounded-2xl p-8 relative">

          {/* Logo area */}
          <div className="text-center mb-8">
            <div style={{
              width: "64px", height: "64px",
              backgroundColor: "#0A1628",
              border: "2px solid rgba(0,229,204,0.4)",
              boxShadow: "0 0 20px rgba(0,229,204,0.2)"
            }} className="rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚽</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              FBL <span style={{ color: "#00E5CC" }}>Academy</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
              className="rounded-lg p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
              <input
                style={{
                  backgroundColor: "#0A1628",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white"
                }}
                className="w-full rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                type="email"
                placeholder="you@fbl.lk"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
              <input
                style={{
                  backgroundColor: "#0A1628",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white"
                }}
                className="w-full rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required />
            </div>
            <button
              style={{
                backgroundColor: loading ? "#00C4AE" : "#00E5CC",
                color: "#0A1628"
              }}
              className="w-full py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 mt-2"
              type="submit"
              disabled={loading}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div style={{ backgroundColor: "#0A1628", border: "1px solid rgba(255,255,255,0.06)" }}
            className="mt-6 rounded-lg p-3 text-xs text-gray-500">
            <p><span style={{ color: "#00E5CC" }}>Admin:</span> admin@academy.lk / admin123</p>
            <p className="mt-1"><span style={{ color: "#00E5CC" }}>Coach:</span> ashan@academy.lk / coach123</p>
          </div>
        </div>
      </div>
    </div>
  );
}