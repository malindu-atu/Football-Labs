import { useEffect, useState } from "react";
import { getSessions, createSession, getCoaches } from "../api";

const AGE_GROUPS = ["U6","U7","U8","U9","U10","U11","U12","U13","U14","U15","U16"];

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [form, setForm] = useState({
    date: "", start_time: "", end_time: "",
    location_id: "", age_group: "U6", coach_id: ""
  });

  useEffect(() => {
    getSessions().then(r => setSessions(r.data));
    getCoaches().then(r => setCoaches(r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createSession(form);
    getSessions().then(r => setSessions(r.data));
    setForm({ date: "", start_time: "", end_time: "", location_id: "", age_group: "U6", coach_id: "" });
  };

  const statusColor = (s) => {
    if (s === "completed") return "bg-green-100 text-green-700";
    if (s === "cancelled") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Sessions</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="font-semibold mb-4 text-gray-700">Create Session</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date</label>
            <input className="border rounded p-2 w-full text-sm" type="date"
              value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Start Time</label>
            <input className="border rounded p-2 w-full text-sm" type="time"
              value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} required />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">End Time</label>
            <input className="border rounded p-2 w-full text-sm" type="time"
              value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} required />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Location ID</label>
            <input className="border rounded p-2 w-full text-sm" placeholder="Paste location UUID"
              value={form.location_id} onChange={e => setForm({...form, location_id: e.target.value})} required />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Age Group</label>
            <select className="border rounded p-2 w-full text-sm"
              value={form.age_group} onChange={e => setForm({...form, age_group: e.target.value})}>
              {AGE_GROUPS.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Assign Coach</label>
            <select className="border rounded p-2 w-full text-sm"
              value={form.coach_id} onChange={e => setForm({...form, coach_id: e.target.value})}>
              <option value="">No coach yet</option>
              {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button className="col-span-3 bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm" type="submit">
            Create Session
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-green-50">
            <tr>{["Date","Time","Age Group","Location","Coach","Status"].map(h => (
              <th key={h} className="p-4 text-left text-sm font-semibold text-gray-600">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="p-4 text-sm">{s.date}</td>
                <td className="p-4 text-sm">{s.start_time} – {s.end_time}</td>
                <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{s.age_group}</span></td>
                <td className="p-4 text-sm">{s.locations?.name || "—"}</td>
                <td className="p-4 text-sm">{s.coaches?.name || <span className="text-red-400">Unassigned</span>}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${statusColor(s.status)}`}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}