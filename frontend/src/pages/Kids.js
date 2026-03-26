import { useEffect, useState } from "react";
import { getKids, createKid } from "../api";

const AGE_GROUPS = ["U6","U7","U8","U9","U10","U11","U12","U13","U14","U15","U16"];

export default function Kids() {
  const [kids, setKids] = useState([]);
  const [form, setForm] = useState({
    name: "", date_of_birth: "", age_group: "U6",
    parent_name: "", parent_contact: ""
  });
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
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Kids</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="font-semibold mb-4 text-gray-700">Add Kid</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
            <input className="border rounded p-2 w-full text-sm" placeholder="Sahan De Silva"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date of Birth</label>
            <input className="border rounded p-2 w-full text-sm" type="date"
              value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Age Group</label>
            <select className="border rounded p-2 w-full text-sm"
              value={form.age_group} onChange={e => setForm({...form, age_group: e.target.value})}>
              {AGE_GROUPS.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Parent Name</label>
            <input className="border rounded p-2 w-full text-sm" placeholder="Parent Name"
              value={form.parent_name} onChange={e => setForm({...form, parent_name: e.target.value})} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Parent Contact</label>
            <input className="border rounded p-2 w-full text-sm" placeholder="07XXXXXXXX"
              value={form.parent_contact} onChange={e => setForm({...form, parent_contact: e.target.value})} />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm" type="submit">
              Add Kid
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-green-50">
            <tr>{["Name","Age Group","Date of Birth","Parent","Contact"].map(h => (
              <th key={h} className="p-4 text-left text-sm font-semibold text-gray-600">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-4 text-center text-gray-400">Loading...</td></tr>}
            {kids.map(k => (
              <tr key={k.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium text-sm">{k.name}</td>
                <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{k.age_group}</span></td>
                <td className="p-4 text-sm text-gray-600">{k.date_of_birth || "—"}</td>
                <td className="p-4 text-sm text-gray-600">{k.parent_name || "—"}</td>
                <td className="p-4 text-sm text-gray-600">{k.parent_contact || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}