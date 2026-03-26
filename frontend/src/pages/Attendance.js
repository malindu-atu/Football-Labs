import { useEffect, useState } from "react";
import { getSessions, getKidsByAgeGroup, markAttendance } from "../api";
import { pageWrapper, card } from "../components/UI";

export default function Attendance() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [kids, setKids] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getSessions().then(r => setSessions(r.data.filter(s => s.status === "scheduled")));
  }, []);

  const handleSessionSelect = async (session) => {
    setSelectedSession(session);
    const res = await getKidsByAgeGroup(session.age_group);
    setKids(res.data);
    const init = {};
    res.data.forEach(k => init[k.id] = "present");
    setAttendance(init);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const records = kids.map(k => ({ kid_id: k.id, status: attendance[k.id] }));
    await markAttendance({ session_id: selectedSession.id, records });
    alert("✅ Attendance marked!");
    setSelectedSession(null);
    getSessions().then(r => setSessions(r.data.filter(s => s.status === "scheduled")));
    setSubmitting(false);
  };

  const statusStyle = (s) => {
    if (s === "present") return { backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" };
    if (s === "late") return { backgroundColor: "rgba(251,191,36,0.1)", color: "#FCD34D" };
    return { backgroundColor: "rgba(239,68,68,0.1)", color: "#F87171" };
  };

  const present = Object.values(attendance).filter(v => v === "present").length;
  const absent = Object.values(attendance).filter(v => v === "absent").length;
  const late = Object.values(attendance).filter(v => v === "late").length;

  return (
    <div style={pageWrapper} className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Attendance</h1>
        <p className="text-gray-400 mt-1">Mark attendance for scheduled sessions</p>
      </div>

      {!selectedSession ? (
        <>
          {sessions.length === 0 ? (
            <div style={card} className="rounded-2xl p-12 text-center">
              <p className="text-4xl mb-3">📅</p>
              <p className="text-white font-semibold">No scheduled sessions</p>
              <p className="text-gray-400 text-sm mt-1">All sessions have been completed or there are none scheduled.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {sessions.map(s => (
                <div key={s.id} onClick={() => handleSessionSelect(s)}
                  style={{ ...card, cursor: "pointer" }}
                  className="rounded-2xl p-6 hover:border-cyan-500/40 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <span style={{ backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" }}
                      className="px-2 py-0.5 rounded-full text-xs font-bold">{s.age_group}</span>
                    <span style={{ color: "#FCD34D", backgroundColor: "rgba(251,191,36,0.1)" }}
                      className="text-xs px-2 py-0.5 rounded-full">Scheduled</span>
                  </div>
                  <p className="text-white font-semibold mb-1">{s.date}</p>
                  <p className="text-gray-400 text-sm">⏰ {s.start_time} – {s.end_time}</p>
                  <p className="text-gray-400 text-sm mt-1">🧑‍🏫 {s.coaches?.name || "No coach"}</p>
                  <p className="text-gray-400 text-sm">📍 {s.locations?.name || "—"}</p>
                  <div style={{ color: "#00E5CC" }} className="text-xs mt-3 opacity-0 group-hover:opacity-100 transition-all">
                    Click to mark attendance →
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={card} className="rounded-2xl overflow-hidden">
          <div style={{ backgroundColor: "#0A1628", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            className="p-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">{selectedSession.age_group} — {selectedSession.date}</h2>
              <p className="text-gray-400 text-sm">{selectedSession.start_time} – {selectedSession.end_time}</p>
            </div>
            <button onClick={() => setSelectedSession(null)}
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#9CA3AF" }}
              className="px-4 py-1.5 rounded-lg text-sm hover:bg-white/5 transition-all">
              ← Back
            </button>
          </div>

          {/* Summary */}
          <div className="p-4 flex gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {[
              { label: "Present", count: present, color: "#00E5CC", bg: "rgba(0,229,204,0.1)" },
              { label: "Absent", count: absent, color: "#F87171", bg: "rgba(239,68,68,0.1)" },
              { label: "Late", count: late, color: "#FCD34D", bg: "rgba(251,191,36,0.1)" },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: s.bg }} className="px-4 py-2 rounded-lg flex items-center gap-2">
                <span style={{ color: s.color }} className="font-bold">{s.count}</span>
                <span style={{ color: s.color }} className="text-sm">{s.label}</span>
              </div>
            ))}
          </div>

          <table className="w-full">
            <thead style={{ backgroundColor: "#0A1628" }}>
              <tr>
                <th className="p-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Student</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {kids.map(k => (
                <tr key={k.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div style={{ backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        {k.name.charAt(0)}
                      </div>
                      <span className="text-white text-sm">{k.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      style={{ ...statusStyle(attendance[k.id]), border: "none", outline: "none", cursor: "pointer" }}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium"
                      value={attendance[k.id]}
                      onChange={e => setAttendance({...attendance, [k.id]: e.target.value})}>
                      <option value="present" style={{ backgroundColor: "#0D1F3C", color: "white" }}>Present</option>
                      <option value="absent" style={{ backgroundColor: "#0D1F3C", color: "white" }}>Absent</option>
                      <option value="late" style={{ backgroundColor: "#0D1F3C", color: "white" }}>Late</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <button onClick={handleSubmit} disabled={submitting}
              style={{ backgroundColor: "#00E5CC", color: "#0A1628" }}
              className="px-8 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all">
              {submitting ? "Submitting..." : "Submit Attendance ✓"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}