import { useEffect, useState } from "react";
import { getSessions, createSession, getCoaches } from "../api";
import { pageWrapper, card, input, btnPrimary } from "../components/UI";

const AGE_GROUPS = ["U6","U7","U8","U9","U10","U11","U12","U13","U14","U15","U16"];

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [form, setForm] = useState({ date: "", start_time: "", end_time: "", location_id: "", age_group: "U6", coach_id: "" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getSessions().then(r => setSessions(r.data));
    getCoaches().then(r => setCoaches(r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createSession(form);
    getSessions().then(r => setSessions(r.data));
    setForm({ date: "", start_time: "", end_time: "", location_id: "", age_group: "U6", coach_id: "" });
    setShowForm(false);
  };

  const statusStyle = (s) => {
    if (s === "completed") return { backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" };
    if (s === "cancelled") return { backgroundColor: "rgba(239,68,68,0.1)", color: "#F87171" };
    return { backgroundColor: "rgba(251,191,36,0.1)", color: "#FCD34D" };
  };

  const selectStyle = { ...input, backgroundImage: "none" };

  return (
    <div style={pageWrapper} className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Sessions</h1>
          <p className="text-gray-400 mt-1 text-sm">Schedule and manage training sessions</p>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          style={btnPrimary}
          className="px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all whitespace-nowrap flex-shrink-0"
        >
          {showForm ? "✕ Cancel" : "+ Create Session"}
        </button>
      </div>

      {/* Create Session Form */}
      {showForm && (
        <div style={card} className="rounded-2xl p-4 sm:p-6 mb-6">
          <h2 className="font-semibold text-white mb-4">Create Session</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Date", key: "date", type: "date" },
              { label: "Start Time", key: "start_time", type: "time" },
              { label: "End Time", key: "end_time", type: "time" },
              { label: "Location ID", key: "location_id", type: "text", placeholder: "Paste location UUID" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-400 mb-1.5 block">{f.label}</label>
                <input style={input}
                  className="w-full rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  type={f.type} placeholder={f.placeholder || ""}
                  value={form[f.key]}
                  onChange={e => setForm({...form, [f.key]: e.target.value})}
                  required={f.key !== "coach_id"} />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Age Group</label>
              <select style={selectStyle} className="w-full rounded-lg p-3 text-sm focus:outline-none"
                value={form.age_group} onChange={e => setForm({...form, age_group: e.target.value})}>
                {AGE_GROUPS.map(g => <option key={g} style={{ backgroundColor: "#0D1F3C" }}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Assign Coach</label>
              <select style={selectStyle} className="w-full rounded-lg p-3 text-sm focus:outline-none"
                value={form.coach_id} onChange={e => setForm({...form, coach_id: e.target.value})}>
                <option value="" style={{ backgroundColor: "#0D1F3C" }}>No coach yet</option>
                {coaches.map(c => <option key={c.id} value={c.id} style={{ backgroundColor: "#0D1F3C" }}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <button style={btnPrimary}
                className="px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-all"
                type="submit">
                + Create Session
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sessions List */}
      <div style={card} className="rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h2 className="font-semibold text-white">All Sessions ({sessions.length})</h2>
        </div>

        {/* Mobile cards */}
        <div className="block sm:hidden">
          {sessions.map(s => (
            <div key={s.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-white font-medium text-sm">{s.date}</p>
                  <p className="text-gray-400 text-xs mt-0.5">⏰ {s.start_time} – {s.end_time}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span style={{ backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" }}
                    className="px-2 py-0.5 rounded-full text-xs">{s.age_group}</span>
                  <span style={statusStyle(s.status)} className="px-2 py-0.5 rounded-full text-xs capitalize">{s.status}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                <span>📍 {s.locations?.name || "—"}</span>
                <span>🧑‍🏫 {s.coaches?.name || <span style={{ color: "#F87171" }}>Unassigned</span>}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: "#0A1628" }}>
              <tr>{["Date","Time","Age Group","Location","Coach","Status"].map(h => (
                <th key={h} className="p-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                  className="hover:bg-white/2 transition-colors">
                  <td className="p-4 text-white text-sm">{s.date}</td>
                  <td className="p-4 text-gray-400 text-sm">{s.start_time} – {s.end_time}</td>
                  <td className="p-4">
                    <span style={{ backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" }}
                      className="px-2 py-0.5 rounded-full text-xs">{s.age_group}</span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{s.locations?.name || "—"}</td>
                  <td className="p-4 text-sm">
                    {s.coaches?.name
                      ? <span className="text-white">{s.coaches.name}</span>
                      : <span style={{ color: "#F87171" }}>Unassigned</span>}
                  </td>
                  <td className="p-4">
                    <span style={statusStyle(s.status)} className="px-2 py-1 rounded-full text-xs capitalize">{s.status}</span>
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