import { useEffect, useState } from "react";
import { getCoaches, createCoach, deleteCoach } from "../api";

const AGE_GROUPS = ["U6","U7","U8","U9","U10","U11","U12","U13","U14","U15","U16"];

export default function Coaches() {
  const [coaches, setCoaches] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", age_groups: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCoaches().then(r => { setCoaches(r.data); setLoading(false); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createCoach(form);
    getCoaches().then(r => setCoaches(r.data));
    setForm({ name: "", email: "", phone: "", age_groups: [] });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this coach?")) return;
    await deleteCoach(id);
    setCoaches(coaches.filter(c => c.id !== id));
  };

  const toggleGroup = (g) => {
    setForm(f => ({
      ...f,
      age_groups: f.age_groups.includes(g)
        ? f.age_groups.filter(x => x !== g)
        : [...f.age_groups, g]
    }));
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Coaches</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="font-semibold mb-4 text-gray-700">Add New Coach</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <input className="border rounded p-2 text-sm" placeholder="Full Name"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input className="border rounded p-2 text-sm" placeholder="Email"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            <input className="border rounded p-2 text-sm" placeholder="Phone"
              value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Age Groups</p>
            <div className="flex flex-wrap gap-2">
              {AGE_GROUPS.map(g => (
                <button type="button" key={g} onClick={() => toggleGroup(g)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors
                    ${form.age_groups.includes(g)
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-green-400"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 text-sm" type="submit">
            Add Coach
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-green-50">
            <tr>{["Name","Email","Phone","Age Groups","Action"].map(h => (
              <th key={h} className="p-4 text-left text-sm font-semibold text-gray-600">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-4 text-center text-gray-400">Loading...</td></tr>}
            {coaches.map(c => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{c.name}</td>
                <td className="p-4 text-gray-600">{c.email}</td>
                <td className="p-4 text-gray-600">{c.phone}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {c.age_groups?.map(g => (
                      <span key={g} className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{g}</span>
                    ))}
                  </div>
                </td>
                <td className="p-4">
                  <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline text-sm">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}