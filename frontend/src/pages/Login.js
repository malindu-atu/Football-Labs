import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, ArrowRight, Footprints, AlertCircle } from "lucide-react";

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
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#060D1A", minHeight: "100vh" }}
      className="flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background glow orbs */}
      <div style={{
        position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(0,229,204,0.07) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", right: "-10%",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(0,153,255,0.05) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(0,229,204,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,204,0.025) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      <div className="w-full max-w-sm relative">
        {/* Card */}
        <div style={{
          backgroundColor: "#0D1F3C",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,229,204,0.05)",
        }} className="rounded-3xl p-8">

          {/* Logo */}
          <div className="text-center mb-8">
            <div style={{
              background: "linear-gradient(135deg, #00E5CC 0%, #0099ff 100%)",
              boxShadow: "0 0 24px rgba(0,229,204,0.4)",
            }} className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Footprints size={26} color="#080F1E" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">FBL Academy</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
              className="flex items-center gap-2 rounded-xl p-3 mb-5">
              <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block font-medium">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  style={{ backgroundColor: "#080F1E", border: "1px solid rgba(255,255,255,0.08)", color: "white" }}
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-all"
                  type="email" placeholder="you@fbl.lk"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block font-medium">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  style={{ backgroundColor: "#080F1E", border: "1px solid rgba(255,255,255,0.08)", color: "white" }}
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-all"
                  type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            </div>

            <button
              style={loading
                ? { backgroundColor: "rgba(0,229,204,0.4)", color: "#080F1E" }
                : { background: "linear-gradient(135deg, #00E5CC 0%, #00BFA5 100%)", color: "#080F1E", boxShadow: "0 4px 16px rgba(0,229,204,0.3)" }}
              className="w-full py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-2"
              type="submit" disabled={loading}>
              {loading ? "Signing in…" : <><span>Sign In</span><ArrowRight size={15} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}