import { useEffect, useState } from "react";
import { UserPlus, ShieldCheck, GraduationCap, X, ChevronDown } from 'lucide-react';
import { getCoaches, createUser } from "../api";
import { useAuth } from "../context/AuthContext";
import { pageWrapper, card, input, btnPrimary, btnOutline } from "../components/UI";

const ROLE_CONFIG = {
  admin: { color: "#FCD34D", bg: "rgba(251,191,36,0.12)", label: "Admin" },
  coach: { color: "#00E5CC", bg: "rgba(0,229,204,0.12)", label: "Coach" },
};

const EMPTY_FORM = {
  first_name: "", last_name: "", email: "",
  password: "", role: "coach", coach_id: "",
};

export default function Users() {
  const { user } = useAuth();
  const [coaches, setCoaches] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getCoaches().then(r => setCoaches(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setSaving(false);
      return;
    }
    if (form.role === "coach" && !form.coach_id) {
      setError("Please select which coach record to link this user to.");
      setSaving(false);
      return;
    }

    try {
      await createUser({
        access_token: user.access_token,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
        coach_id: form.role === "coach" ? form.coach_id : null,
      });
      setSuccess(`✓ User ${form.first_name} ${form.last_name} created successfully.`);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to create user.");
    } finally {
      setSaving(false);
    }
  };

  const selectedCoach = coaches.find(c => c.id === form.coach_id);

  return (
    <div style={pageWrapper} className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Create login accounts for admins and coaches
          </p>
        </div>
        <button
          onClick={() => { setShowForm(f => !f); setError(""); setSuccess(""); }}
          style={showForm ? btnOutline : btnPrimary}
          className="px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all whitespace-nowrap flex-shrink-0"
        >
          {showForm ? "Cancel" : "Add User"}
        </button>
      </div>

      {/* Success banner */}
      {success && (
        <div style={{ backgroundColor: "rgba(0,229,204,0.1)", border: "1px solid rgba(0,229,204,0.3)" }}
          className="rounded-xl p-4 mb-6 text-cyan-400 text-sm flex items-center gap-2">
          {success}
        </div>
      )}

      {/* Add User Form */}
      {showForm && (
        <div style={card} className="rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-white mb-5">New User Account</h2>

          {error && (
            <div style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
              className="rounded-lg p-3 mb-4 text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Role selector */}
            <div className="mb-5">
              <label className="text-xs text-gray-400 mb-2 block">Role</label>
              <div className="flex gap-3">
                {["admin", "coach"].map(r => {
                  const cfg = ROLE_CONFIG[r];
                  const active = form.role === r;
                  return (
                    <button key={r} type="button"
                      onClick={() => setForm(f => ({ ...f, role: r, coach_id: "" }))}
                      style={active
                        ? { backgroundColor: cfg.color, color: "#0A1628", border: `1px solid ${cfg.color}` }
                        : { backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}
                      className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all">
                      {r === "admin" ? "Admin" : "Coach"}
                    </button>
                  );
                })}
              </div>
              <p className="text-gray-600 text-xs mt-2">
                {form.role === "admin"
                  ? "Admins have full access to all pages and settings."
                  : "Coaches can access their portal and mark attendance."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">First Name</label>
                <input style={input}
                  className="w-full rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  placeholder="First name" value={form.first_name}
                  onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Last Name</label>
                <input style={input}
                  className="w-full rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  placeholder="Last name" value={form.last_name}
                  onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
                <input style={input} type="email"
                  className="w-full rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  placeholder="user@fbl.lk" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
                <input style={input} type="password"
                  className="w-full rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  placeholder="Min. 6 characters" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
            </div>

            {/* Coach linking — only shown when role is coach */}
            {form.role === "coach" && (
              <div className="mb-5">
                <label className="text-xs text-gray-400 mb-1.5 block">
                  Link to Coach Record <span className="text-red-400">*</span>
                </label>
                <select
                  style={{ ...input, backgroundImage: "none" }}
                  className="w-full rounded-lg p-3 text-sm focus:outline-none"
                  value={form.coach_id}
                  onChange={e => setForm(f => ({ ...f, coach_id: e.target.value }))}
                >
                  <option value="" style={{ backgroundColor: "#0D1F3C" }}>
                    — Select a coach —
                  </option>
                  {coaches.map(c => (
                    <option key={c.id} value={c.id} style={{ backgroundColor: "#0D1F3C" }}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
                {selectedCoach && (
                  <div style={{ backgroundColor: "rgba(0,229,204,0.06)", border: "1px solid rgba(0,229,204,0.15)" }}
                    className="mt-2 rounded-lg px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
                    <span style={{ color: "#00E5CC" }}>✓</span>
                    This login will be linked to <span className="text-white font-medium">{selectedCoach.name}</span>
                    {selectedCoach.age_groups?.length > 0 && (
                      <span className="text-gray-500">· {selectedCoach.age_groups.join(", ")}</span>
                    )}
                  </div>
                )}
                {coaches.length === 0 && (
                  <p className="text-gray-600 text-xs mt-1">
                    No coaches found. Add a coach in the Coaches page first.
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                style={saving ? { backgroundColor: "rgba(0,229,204,0.4)", color: "#0A1628" } : btnPrimary}
                className="px-8 py-3 rounded-lg font-semibold text-sm transition-all"
              >
                {saving ? "Creating…" : "Create User"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError(""); }}
                style={btnOutline}
                className="px-5 py-3 rounded-lg text-sm font-semibold transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Info card */}
      <div style={card} className="rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-4">How User Access Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: "🛡",
              title: "Admin",
              color: "#FCD34D",
              points: [
                "Full access to all pages",
                "Can manage coaches, students, sessions",
                "Can view analytics and payments",
                "Can create new user accounts",
              ],
            },
            {
              icon: "🧑‍🏫",
              title: "Coach",
              color: "#00E5CC",
              points: [
                "Access to their own coach portal",
                "Can mark attendance for sessions",
                "Must be linked to a coach record",
                "Cannot access admin-only pages",
              ],
            },
          ].map(role => (
            <div key={role.title}
              style={{ backgroundColor: "#0A1628", border: "1px solid rgba(255,255,255,0.06)" }}
              className="rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{role.icon}</span>
                <span style={{ color: role.color }} className="font-semibold">{role.title}</span>
              </div>
              <ul className="space-y-1.5">
                {role.points.map(p => (
                  <li key={p} className="text-gray-400 text-xs flex items-start gap-2">
                    <span style={{ color: role.color }} className="mt-0.5 flex-shrink-0">·</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} className="mt-5 pt-5">
          <p className="text-gray-500 text-xs">
            💡 Users are created in <span className="text-gray-400">Supabase Authentication</span> and
            their profile is automatically linked. To view all users or reset passwords, go to your{" "}
            <span className="text-gray-400">Supabase Dashboard → Authentication → Users</span>.
          </p>
        </div>
      </div>
    </div>
  );
}