import { useEffect, useState } from "react";
import { getStudentAnalytics, getCoachAnalytics, getKids, getCoaches } from "../api";
import { pageWrapper, card, input } from "../components/UI";

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

  const rateColor = (r) => r >= 80 ? "#00E5CC" : r >= 50 ? "#FCD34D" : "#F87171";

  const StatCard = ({ value, label, color }) => (
    <div style={{ backgroundColor: "#0A1628", border: "1px solid rgba(255,255,255,0.06)" }}
      className="rounded-xl p-4 text-center">
      <p style={{ color: color || "#00E5CC" }} className="text-3xl font-bold">{value}</p>
      <p className="text-gray-400 text-xs mt-1">{label}</p>
    </div>
  );

  return (
    <div style={pageWrapper} className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">Track performance and attendance insights</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Student Analytics */}
        <div style={card} className="rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">👦</span>
            <h2 className="font-semibold text-white">Student Analytics</h2>
          </div>
          <select style={{ ...input, backgroundImage: "none" }}
            className="w-full rounded-lg p-3 text-sm focus:outline-none mb-4"
            onChange={e => loadKidStats(e.target.value)}>
            <option value="" style={{ backgroundColor: "#0D1F3C" }}>Select a student...</option>
            {kids.map(k => <option key={k.id} value={k.id} style={{ backgroundColor: "#0D1F3C" }}>{k.name} ({k.age_group})</option>)}
          </select>

          {kidStats ? (
            <div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <StatCard value={`${kidStats.attendance_rate}%`} label="Attendance Rate" color={rateColor(kidStats.attendance_rate)} />
                <StatCard value={kidStats.present} label="Present" />
                <StatCard value={kidStats.total_sessions} label="Total Sessions" color="#9CA3AF" />
              </div>
              <div style={{ backgroundColor: "#0A1628", border: "1px solid rgba(255,255,255,0.06)" }}
                className="rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Recent Sessions</p>
                {kidStats.records.slice(0, 6).map(r => (
                  <div key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    className="flex justify-between items-center py-2 last:border-0">
                    <span className="text-gray-400 text-xs">{r.sessions?.date || "—"}</span>
                    <span style={r.status === "present"
                      ? { color: "#00E5CC", backgroundColor: "rgba(0,229,204,0.1)" }
                      : { color: "#F87171", backgroundColor: "rgba(239,68,68,0.1)" }}
                      className="text-xs px-2 py-0.5 rounded-full capitalize">{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: "#0A1628" }} className="rounded-xl p-8 text-center">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-gray-500 text-sm">Select a student to view their stats</p>
            </div>
          )}
        </div>

        {/* Coach Analytics */}
        <div style={card} className="rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🧑‍🏫</span>
            <h2 className="font-semibold text-white">Coach Analytics</h2>
          </div>
          <select style={{ ...input, backgroundImage: "none" }}
            className="w-full rounded-lg p-3 text-sm focus:outline-none mb-4"
            onChange={e => loadCoachStats(e.target.value)}>
            <option value="" style={{ backgroundColor: "#0D1F3C" }}>Select a coach...</option>
            {coaches.map(c => <option key={c.id} value={c.id} style={{ backgroundColor: "#0D1F3C" }}>{c.name}</option>)}
          </select>

          {coachStats ? (
            <div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <StatCard value={coachStats.total_assigned} label="Assigned Sessions" />
                <StatCard value={coachStats.completed} label="Completed" />
              </div>
              <div style={{ backgroundColor: "#0A1628", border: "1px solid rgba(255,255,255,0.06)" }}
                className="rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Session History</p>
                {coachStats.sessions.slice(0, 6).map(s => (
                  <div key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    className="flex justify-between items-center py-2 last:border-0">
                    <div>
                      <span className="text-white text-xs">{s.date}</span>
                      <span style={{ backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" }}
                        className="ml-2 text-xs px-1.5 py-0.5 rounded-full">{s.age_group}</span>
                    </div>
                    <span style={s.status === "completed"
                      ? { color: "#00E5CC", backgroundColor: "rgba(0,229,204,0.1)" }
                      : { color: "#FCD34D", backgroundColor: "rgba(251,191,36,0.1)" }}
                      className="text-xs px-2 py-0.5 rounded-full capitalize">{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: "#0A1628" }} className="rounded-xl p-8 text-center">
              <p className="text-3xl mb-2">📈</p>
              <p className="text-gray-500 text-sm">Select a coach to view their stats</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}