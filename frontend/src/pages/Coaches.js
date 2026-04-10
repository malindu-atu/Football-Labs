import { useEffect, useState } from "react";
import { getCoaches, createCoach, deleteCoach } from "../api";
import { pageWrapper, card, input, btnPrimary, btnOutline } from "../components/UI";
import { UserPlus, Trash2, Phone, Mail, Users, X, Plus, ChevronDown } from "lucide-react";

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
    <div style={pageWrapper} className="p-5 sm:p-7 lg:p-9">

      {/* Header */}
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Coaches</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your academy coaching staff</p>
        </div>
        <button onClick={() => setShowForm(f => !f)}
          style={showForm ? btnOutline : btnPrimary}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all">
          {showForm ? <><X size={15} /> Cancel</> : <><UserPlus size={15} /> Add Coach</>}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={card} className="rounded-2xl p-5 mb-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <UserPlus size={16} style={{ color: "#00E5CC" }} /> New Coach
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { placeholder: "Full name", key: "name", icon: Users },
                { placeholder: "Email address", key: "email", type: "email", icon: Mail },
                { placeholder: "Phone number", key: "phone", icon: Phone },
              ].map(({ placeholder, key, type, icon: Icon }) => (
                <div key={key} className="relative">
                  <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input style={input}
                    className="w-full rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                    placeholder={placeholder} type={type || "text"}
                    value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}
                    required={key !== "phone"} />
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">Age Groups</p>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map(g => (
                  <button type="button" key={g} onClick={() => toggleGroup(g)}
                    style={form.age_groups.includes(g)
                      ? { backgroundColor: "#00E5CC", color: "#080F1E", border: "1px solid #00E5CC" }
                      : { backgroundColor: "transparent", color: "#6B7280", border: "1px solid rgba(255,255,255,0.08)" }}
                    className="px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:border-cyan-500/40">
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <button style={btnPrimary}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all">
              <Plus size={15} /> Add Coach
            </button>
          </form>
        </div>
      )}

      {/* Coaches list */}
      <div style={card} className="rounded-2xl overflow-hidden">
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="font-semibold text-white text-sm">All Coaches</p>
          <span style={{ backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" }}
            className="text-xs px-2.5 py-0.5 rounded-full font-semibold">{coaches.length}</span>
        </div>

        {loading && <p className="p-8 text-center text-gray-600 text-sm">Loading…</p>}

        <div className="divide-y divide-white/5">
          {coaches.map(c => (
            <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-white/2 transition-colors group">
              {/* Avatar */}
              <div style={{ background: "linear-gradient(135deg, #00E5CC22, #00E5CC11)", border: "1px solid rgba(0,229,204,0.2)", color: "#00E5CC" }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0">
                {c.name.charAt(0)}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{c.name}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1 text-gray-500 text-xs">
                    <Mail size={11} /> {c.email}
                  </span>
                  {c.phone && (
                    <span className="flex items-center gap-1 text-gray-500 text-xs">
                      <Phone size={11} /> {c.phone}
                    </span>
                  )}
                </div>
              </div>
              {/* Age groups */}
              <div className="hidden sm:flex flex-wrap gap-1 max-w-xs justify-end">
                {c.age_groups?.map(g => (
                  <span key={g} style={{ backgroundColor: "rgba(0,229,204,0.08)", color: "#00E5CC", border: "1px solid rgba(0,229,204,0.15)" }}
                    className="px-2 py-0.5 rounded-lg text-xs font-medium">{g}</span>
                ))}
              </div>
              {/* Delete */}
              <button onClick={() => handleDelete(c.id)}
                className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                style={{ color: "#F87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                <Trash2 size={12} /> Remove
              </button>
            </div>
          ))}
        </div>

        {!loading && coaches.length === 0 && (
          <div className="p-12 text-center">
            <div style={{ backgroundColor: "rgba(0,229,204,0.08)", color: "#00E5CC" }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users size={22} />
            </div>
            <p className="text-gray-500 text-sm">No coaches yet. Add your first coach above.</p>
          </div>
        )}
      </div>
    </div>
  );
}