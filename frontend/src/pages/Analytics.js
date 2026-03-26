import { useEffect, useState } from "react";
import { getStudentAnalytics, getCoachAnalytics, getKids, getCoaches } from "../api";

export default function Analytics() {
  const [kids, setKids] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [kidStats, setKidStats] = useState(null);
  const [coachStats, setCoachStats] = useState(null);

  useEffect(() => {
    getKids().then(r => setKids(r.data));
    getCoaches().then(r => setCoaches(r.data));
  }, []);

  const loadKidStats = async (id) => {
    if (!id) return setKidStats(null);
    const res = await getStudentAnalytics(id);
    setKidStats(res.data);
  };

  const loadCoachStats = async (id) => {
    if (!id) return setCoachStats(null);
    const res = await getCoachAnalytics(id);
    setCoachStats(res.data);
  };

  const rateColor = (rate) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Analytics</h1>

      <div className="grid grid-cols-2 gap-8">
        {/* Student Analytics */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4 text-gray-700">👦 Student Analytics</h2>
          <select className="border rounded p-2 w-full mb-4 text-sm"
            onChange={e => loadKidStats(e.target.value)}>
            <option value="">Select a student...</option>
            {kids.map(k => (
              <option key={k.id} value={k.id}>{k.name} ({k.age_group})</option>
            ))}
          </select>
          {kidStats ? (
            <div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className={`text-3xl font-bold ${rateColor(kidStats.attendance_rate)}`}>
                    {kidStats.attendance_rate}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Attendance Rate</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{kidStats.present}</p>
                  <p className="text-xs text-gray-500 mt-1">Sessions Present</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-gray-600">{kidStats.total_sessions}</p>
                  <p className="text-xs text-gray-500 mt-1">Total Sessions</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-500 mb-2 font-semibold">Recent Sessions</p>
                {kidStats.records.slice(0, 5).map(r => (
                  <div key={r.id} className="flex justify-between text-xs py-1 border-b last:border-0">
                    <span>{r.sessions?.date || "—"}</span>
                    <span className={r.status === "present" ? "text-green-600" : "text-red-500"}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">Select a student to view their stats</p>
          )}
        </div>

        {/* Coach Analytics */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4 text-gray-700">🧑‍🏫 Coach Analytics</h2>
          <select className="border rounded p-2 w-full mb-4 text-sm"
            onChange={e => loadCoachStats(e.target.value)}>
            <option value="">Select a coach...</option>
            {coaches.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {coachStats ? (
            <div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{coachStats.total_assigned}</p>
                  <p className="text-xs text-gray-500 mt-1">Assigned Sessions</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{coachStats.completed}</p>
                  <p className="text-xs text-gray-500 mt-1">Completed</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-500 mb-2 font-semibold">Session History</p>
                {coachStats.sessions.slice(0, 5).map(s => (
                  <div key={s.id} className="flex justify-between text-xs py-1 border-b last:border-0">
                    <span>{s.date} — {s.age_group}</span>
                    <span className={s.status === "completed" ? "text-green-600" : "text-yellow-600"}>{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">Select a coach to view their stats</p>
          )}
        </div>
      </div>
    </div>
  );
}