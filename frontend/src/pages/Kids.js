import { useEffect, useState } from "react";
import { getKids, createKid } from "../api";
import { pageWrapper, card, input, btnPrimary } from "../components/UI";

const AGE_GROUPS = ["U6","U7","U8","U9","U10","U11","U12","U13","U14","U15","U16"];

export default function Kids() {
  const [kids, setKids] = useState([]);
  const [form, setForm] = useState({ name: "", date_of_birth: "", age_group: "U6", parent_name: "", parent_contact: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getKids().then(r => { setKids(r.data); setLoading(false); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createKid(form);
    getKids().then(r => setKids(r.data));
    setForm({ name: "", date_of_birth: "", age_group: "U6", parent_name: "", parent_contact: "" });
  };

  return (
    <div style={pageWrapper} className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Students</h1>
        <p className="text-gray-400 mt-1">Manage academy students across all age groups</p>
      </div>

      <div style={card} className="rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-white mb-4">Add Student</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Full Name</label>
            <input style={input} className="w-full rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              placeholder="Student name" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Date of Birth</label>
            <input style={input} className="w-full rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              type="date" value={form.date_of_birth}
              onChange={e => setForm({...form, date_of_birth: e.target.value})} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Age Group</label>
            <select style={{ ...input, backgroundImage: "none" }}
              className="w-full rounded-lg p-3 text-sm focus:outline-none"
              value={form.age_group} onChange={e => setForm({...form, age_group: e.target.value})}>
              {AGE_GROUPS.map(g => <option key={g} style={{ backgroundColor: "#0D1F3C" }}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Parent Name</label>
            <input style={input} className="w-full rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              placeholder="Parent name" value={form.parent_name}
              onChange={e => setForm({...form, parent_name: e.target.value})} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Parent Contact</label>
            <input style={input} className="w-full rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              placeholder="07XXXXXXXX" value={form.parent_contact}
              onChange={e => setForm({...form, parent_contact: e.target.value})} />
          </div>
          <div className="flex items-end">
            <button style={btnPrimary} className="w-full py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-all" type="submit">
              + Add Student
            </button>
          </div>
        </form>
      </div>

      <div style={card} className="rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h2 className="font-semibold text-white">All Students ({kids.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: "#0A1628" }}>
              <tr>{["Name","Age Group","Date of Birth","Parent","Contact"].map(h => (
                <th key={h} className="p-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading students...</td></tr>}
              {kids.map(k => (
                <tr key={k.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                  className="hover:bg-white/2 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div style={{ backgroundColor: "rgba(0,229,204,0.15)", color: "#00E5CC" }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        {k.name.charAt(0)}
                      </div>
                      <span className="text-white font-medium">{k.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span style={{ backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" }}
                      className="px-2 py-0.5 rounded-full text-xs">{k.age_group}</span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{k.date_of_birth || "—"}</td>
                  <td className="p-4 text-gray-400 text-sm">{k.parent_name || "—"}</td>
                  <td className="p-4 text-gray-400 text-sm">{k.parent_contact || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}