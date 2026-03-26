import { useEffect, useState } from "react";
import { getSessions, getKidsByAgeGroup, markAttendance } from "../api";

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
    alert("✅ Attendance marked successfully!");
    setSelectedSession(null);
    getSessions().then(r => setSessions(r.data.filter(s => s.status === "scheduled")));
    setSubmitting(false);
  };

  const statusColor = (s) => {
    if (s === "present") return "bg-green-100 text-green-700";
    if (s === "late") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Mark Attendance</h1>

      {!selectedSession ? (
        <>
          <p className="text-gray-500 mb-4">Select a session to mark attendance for:</p>
          {sessions.length === 0 && (
            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
              No scheduled sessions found.
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            {sessions.map(s => (
              <div key={s.id} onClick={() => handleSessionSelect(s)}
                className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-md hover:border-2 hover:border-green-500 transition-all">
                <p className="font-bold text-green-700 text-lg">{s.age_group}</p>
                <p className="text-gray-600 text-sm mt-1">📅 {s.date}</p>
                <p className="text-gray-600 text-sm">⏰ {s.start_time} – {s.end_time}</p>
                <p className="text-gray-500 text-sm mt-2">🧑‍🏫 {s.coaches?.name || "No coach assigned"}</p>
                <p className="text-gray-500 text-sm">📍 {s.locations?.name || "—"}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-semibold text-lg">{selectedSession.age_group} — {selectedSession.date}</h2>
              <p className="text-gray-500 text-sm">{selectedSession.start_time} – {selectedSession.end_time}</p>
            </div>
            <button onClick={() => setSelectedSession(null)}
              className="text-gray-500 hover:underline text-sm">← Back to sessions</button>
          </div>

          <div className="mb-4 flex gap-2 text-xs">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
              Present: {Object.values(attendance).filter(v => v === "present").length}
            </span>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">
              Absent: {Object.values(attendance).filter(v => v === "absent").length}
            </span>
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
              Late: {Object.values(attendance).filter(v => v === "late").length}
            </span>
          </div>

          <table className="w-full mb-6">
            <thead className="bg-green-50">
              <tr>
                <th className="p-3 text-left text-sm font-semibold text-gray-600">Kid</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {kids.map(k => (
                <tr key={k.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-sm font-medium">{k.name}</td>
                  <td className="p-3">
                    <select
                      className={`border rounded p-1 text-sm ${statusColor(attendance[k.id])}`}
                      value={attendance[k.id]}
                      onChange={e => setAttendance({...attendance, [k.id]: e.target.value})}>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={handleSubmit} disabled={submitting}
            className="bg-green-600 text-white px-8 py-2 rounded hover:bg-green-700 disabled:opacity-50">
            {submitting ? "Submitting..." : "Submit Attendance"}
          </button>
        </div>
      )}
    </div>
  );
}