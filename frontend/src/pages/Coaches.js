import { useEffect, useState } from "react";
import { getCoaches, createCoach, deleteCoach } from "../api";
import { pageWrapper, card, input, btnPrimary } from "../components/UI";

const AGE_GROUPS = ["U6","U7","U8","U9","U10","U11","U12","U13","U14","U15","U16"];

export default function Coaches() {
  const [coaches, setCoaches] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", age_groups: [] });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getCoaches().then(r => { setCoaches(r.data); setLoading(false); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createCoach(form);
    getCoaches().then(r => setCoaches(r.data));
    setForm({ name: "", email: "", phone: "", age_groups: [] });
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this coach?")) return;
    await deleteCoach(id);
    setCoaches(coaches.filter(c => c.id !== id));
  };

  const toggleGroup = (g) => {
    setForm(f => ({
      ...f,
      age_groups: f.age_groups.includes(g) ? f.age_groups.filter(x => x !== g) : [...f.age_groups, g]
    }));
  };

  return (
    <div style={pageWrapper} className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Coaches</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage your academy coaching staff</p>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          style={btnPrimary}
          className="px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all whitespace-nowrap flex-shrink-0"
        >
          {showForm ? "✕ Cancel" : "+ Add Coach"}
        </button>
      </div>

      {/* Add Coach Form */}
      {showForm && (
        <div style={card} className="rounded-2xl p-4 sm:p-6 mb-6">
          <h2 className="font-semibold text-white mb-4">Add New Coach</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { placeholder: "Full Name", key: "name" },
                { placeholder: "Email", key: "email", type: "email" },
                { placeholder: "Phone", key: "phone" }
              ].map(f => (
                <input key={f.key}
                  style={input}
                  className="rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  placeholder={f.placeholder}
                  type={f.type || "text"}
                  value={form[f.key]}
                  onChange={e => setForm({...form, [f.key]: e.target.value})}
                  required={f.key !== "phone"} />
              ))}
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Age Groups</p>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map(g => (
                  <button type="button" key={g} onClick={() => toggleGroup(g)}
                    style={form.age_groups.includes(g)
                      ? { backgroundColor: "#00E5CC", color: "#0A1628", border: "1px solid #00E5CC" }
                      : { backgroundColor: "transparent", color: "#9CA3AF", border: "1px solid rgba(255,255,255,0.1)" }}
                    className="px-3 py-1 rounded-full text-sm transition-all hover:border-cyan-500/50">
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <button style={btnPrimary}
              className="px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-all"
              type="submit">
              + Add Coach
            </button>
          </form>
        </div>
      )}

      {/* Coaches List */}
      <div style={card} className="rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h2 className="font-semibold text-white">All Coaches ({coaches.length})</h2>
        </div>

        {/* Mobile cards */}
        <div className="block sm:hidden">
          {loading && <p className="p-6 text-center text-gray-500 text-sm">Loading coaches...</p>}
          {coaches.map(c => (
            <div key={c.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} className="p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div style={{ backgroundColor: "#00E5CC", color: "#0A1628" }}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate">{c.name}</p>
                    <p className="text-gray-400 text-xs truncate">{c.email}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(c.id)}
                  style={{ color: "#F87171", border: "1px solid rgba(248,113,113,0.2)" }}
                  className="px-3 py-1 rounded-lg text-xs hover:bg-red-500/10 transition-all flex-shrink-0">
                  Remove
                </button>
              </div>
              <div className="ml-12">
                {c.phone && <p className="text-gray-400 text-xs mb-2">📞 {c.phone}</p>}
                <div className="flex flex-wrap gap-1">
                  {c.age_groups?.map(g => (
                    <span key={g} style={{ backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" }}
                      className="px-2 py-0.5 rounded-full text-xs">{g}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: "#0A1628" }}>
              <tr>{["Name","Email","Phone","Age Groups","Action"].map(h => (
                <th key={h} className="p-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading coaches...</td></tr>}
              {coaches.map(c => (
                <tr key={c.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                  className="hover:bg-white/2 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div style={{ backgroundColor: "#00E5CC", color: "#0A1628" }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        {c.name.charAt(0)}
                      </div>
                      <span className="text-white font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{c.email}</td>
                  <td className="p-4 text-gray-400 text-sm">{c.phone || "—"}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {c.age_groups?.map(g => (
                        <span key={g} style={{ backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" }}
                          className="px-2 py-0.5 rounded-full text-xs">{g}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(c.id)}
                      style={{ color: "#F87171", border: "1px solid rgba(248,113,113,0.2)" }}
                      className="px-3 py-1 rounded-lg text-xs hover:bg-red-500/10 transition-all">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}