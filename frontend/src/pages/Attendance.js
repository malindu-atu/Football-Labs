import { useEffect, useState } from "react";
import { getKids, markAttendance, getSessionAttendance } from "../api";
import { useAuth } from "../context/AuthContext";
import { pageWrapper, card, input, btnPrimary, btnOutline } from "../components/UI";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000/api" });
api.interceptors.request.use(c => {
  const u = JSON.parse(localStorage.getItem("user"));
  if (u?.access_token) c.headers.Authorization = `Bearer ${u.access_token}`;
  return c;
});
const getThisWeek = () => api.get("/sessions/this-week");
const generateWeek = () => api.post("/sessions/generate-week");

const STATUS_STYLE = {
  present: { backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" },
  absent:  { backgroundColor: "rgba(239,68,68,0.1)",  color: "#F87171" },
  late:    { backgroundColor: "rgba(251,191,36,0.1)", color: "#FCD34D" },
};

function formatDay(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export default function Attendance() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendance, setAttendance] = useState({});   // kid_id → status
  const [walkIns, setWalkIns] = useState([]);          // [{kid_id, status}] for non-enrolled walk-ins
  const [allKids, setAllKids] = useState([]);
  const [walkInSearch, setWalkInSearch] = useState("");
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const isCoach = user?.role === "coach";

  const loadSessions = async () => {
    setLoading(true);
    try {
      // Auto-generate this week's sessions if not done yet
      await generateWeek();
      const res = await getThisWeek();
      let data = res.data;
      // Coaches only see their own sessions
      if (isCoach && user?.coach?.id) {
        data = data.filter(s => s.coach_id === user.coach.id);
      }
      // Sort by date then time
      data.sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time));
      setSessions(data);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    loadSessions();
    getKids().then(r => setAllKids(r.data));
  }, []);

  const handleSessionSelect = async (session) => {
    setSelectedSession(session);
    setWalkIns([]);
    setShowWalkIn(false);
    setDone(false);

    // Get enrolled students from template
    const enrolled = session.session_templates?.session_enrollments?.map(e => e.kids).filter(Boolean) || [];

    // Check if attendance already marked
    const existing = await getSessionAttendance(session.id);
    const existingMap = {};
    existing.data.forEach(r => { existingMap[r.kid_id] = r.status; });

    const init = {};
    enrolled.forEach(k => { init[k.id] = existingMap[k.id] || "present"; });

    // Any existing walk-ins (kids in attendance but not enrolled)
    const enrolledIds = new Set(enrolled.map(k => k.id));
    const existingWalkIns = existing.data
      .filter(r => !enrolledIds.has(r.kid_id))
      .map(r => ({ kid_id: r.kid_id, status: r.status, kid: allKids.find(k => k.id === r.kid_id) }));

    setAttendance(init);
    setWalkIns(existingWalkIns);
    if (session.status === "completed") setDone(true);
  };

  const addWalkIn = (kid) => {
    if (attendance[kid.id] !== undefined) return; // already enrolled
    if (walkIns.find(w => w.kid_id === kid.id)) return; // already added
    setWalkIns(w => [...w, { kid_id: kid.id, status: "present", kid }]);
    setWalkInSearch("");
    setShowWalkIn(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const enrolledRecords = Object.entries(attendance).map(([kid_id, status]) => ({ kid_id, status }));
    const walkInRecords = walkIns.map(w => ({ kid_id: w.kid_id, status: w.status }));
    await markAttendance({ session_id: selectedSession.id, records: [...enrolledRecords, ...walkInRecords] });
    setDone(true);
    setSubmitting(false);
    loadSessions();
  };

  const enrolledKids = selectedSession
    ? (selectedSession.session_templates?.session_enrollments?.map(e => e.kids).filter(Boolean) || [])
    : [];

  const present = Object.values(attendance).filter(v => v === "present").length +
    walkIns.filter(w => w.status === "present").length;
  const absent = Object.values(attendance).filter(v => v === "absent").length +
    walkIns.filter(w => w.status === "absent").length;
  const late = Object.values(attendance).filter(v => v === "late").length +
    walkIns.filter(w => w.status === "late").length;

  const walkInSuggestions = walkInSearch.length > 1
    ? allKids.filter(k =>
        k.name.toLowerCase().includes(walkInSearch.toLowerCase()) &&
        attendance[k.id] === undefined &&
        !walkIns.find(w => w.kid_id === k.id)
      )
    : [];

  if (!selectedSession) {
    return (
      <div style={pageWrapper} className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Attendance</h1>
          <p className="text-gray-400 mt-1 text-sm">This week's sessions</p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div style={{ borderColor: "#00E5CC" }} className="animate-spin rounded-full h-4 w-4 border-b-2" />
            Loading sessions…
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <div style={card} className="rounded-2xl p-12 text-center">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-white font-semibold">No sessions this week</p>
            <p className="text-gray-400 text-sm mt-1">
              Add fixed sessions in the Sessions page first.
            </p>
          </div>
        )}

        {!loading && sessions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map(s => {
              const enrolledCount = s.session_templates?.session_enrollments?.length || 0;
              const isCompleted = s.status === "completed";
              return (
                <div key={s.id} onClick={() => handleSessionSelect(s)}
                  style={{ ...card, cursor: "pointer", opacity: isCompleted ? 0.7 : 1 }}
                  className="rounded-2xl p-5 hover:border-cyan-500/40 transition-all group active:scale-95">
                  <div className="flex items-start justify-between mb-3">
                    <span style={{ backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" }}
                      className="px-2 py-0.5 rounded-full text-xs font-bold">{s.age_group}</span>
                    <span style={isCompleted
                        ? { backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" }
                        : { backgroundColor: "rgba(251,191,36,0.1)", color: "#FCD34D" }}
                      className="text-xs px-2 py-0.5 rounded-full capitalize">{s.status}</span>
                  </div>
                  <p className="text-white font-semibold mb-1">{formatDay(s.date)}</p>
                  <p className="text-gray-400 text-sm">⏰ {s.start_time} – {s.end_time}</p>
                  <p className="text-gray-400 text-sm mt-1">🧑‍🏫 {s.coaches?.name || "No coach"}</p>
                  <p className="text-gray-500 text-xs mt-1">👦 {enrolledCount} enrolled students</p>
                  <div style={{ color: "#00E5CC" }} className="text-xs mt-3 opacity-0 group-hover:opacity-60 transition-all">
                    {isCompleted ? "View / edit attendance →" : "Mark attendance →"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Attendance marking view ──────────────────────────────────────────────
  return (
    <div style={pageWrapper} className="p-4 sm:p-6 lg:p-8">
      <div style={card} className="rounded-2xl overflow-hidden">
        {/* Header */}
        <div style={{ backgroundColor: "#0A1628", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          className="p-4 sm:p-5 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-semibold text-white">
              {selectedSession.age_group} — {formatDay(selectedSession.date)}
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
              {selectedSession.start_time} – {selectedSession.end_time}
              {selectedSession.coaches?.name && ` · ${selectedSession.coaches.name}`}
            </p>
          </div>
          <button onClick={() => setSelectedSession(null)}
            style={btnOutline} className="px-4 py-1.5 rounded-lg text-sm transition-all flex-shrink-0">
            ← Back
          </button>
        </div>

        {/* Summary */}
        <div className="p-3 sm:p-4 flex gap-2 flex-wrap" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {[
            { label: "Present", count: present, color: "#00E5CC", bg: "rgba(0,229,204,0.1)" },
            { label: "Absent",  count: absent,  color: "#F87171", bg: "rgba(239,68,68,0.1)" },
            { label: "Late",    count: late,    color: "#FCD34D", bg: "rgba(251,191,36,0.1)" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: s.bg }} className="px-4 py-2 rounded-lg flex items-center gap-2">
              <span style={{ color: s.color }} className="font-bold">{s.count}</span>
              <span style={{ color: s.color }} className="text-xs">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Enrolled students */}
        <div className="p-4 border-b border-white/5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            Enrolled Students ({enrolledKids.length})
          </p>
          {enrolledKids.length === 0 && (
            <p className="text-gray-600 text-sm">No students enrolled in this session. Go to Sessions → Manage Students.</p>
          )}
          <div className="space-y-2">
            {enrolledKids.map(k => (
              <div key={k.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div style={{ backgroundColor: "rgba(0,229,204,0.15)", color: "#00E5CC" }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {k.name.charAt(0)}
                  </div>
                  <span className="text-white text-sm">{k.name}</span>
                </div>
                <select
                  style={{ ...STATUS_STYLE[attendance[k.id] || "present"], border: "none", outline: "none", cursor: "pointer" }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  value={attendance[k.id] || "present"}
                  onChange={e => setAttendance(a => ({ ...a, [k.id]: e.target.value }))}
                  disabled={done}>
                  <option value="present" style={{ backgroundColor: "#0D1F3C", color: "white" }}>Present</option>
                  <option value="absent"  style={{ backgroundColor: "#0D1F3C", color: "white" }}>Absent</option>
                  <option value="late"    style={{ backgroundColor: "#0D1F3C", color: "white" }}>Late</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Walk-ins */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Walk-in Students ({walkIns.length})
            </p>
            {!done && (
              <button onClick={() => setShowWalkIn(w => !w)} style={btnOutline}
                className="px-3 py-1 rounded-lg text-xs font-semibold transition-all">
                + Add Walk-in
              </button>
            )}
          </div>

          {showWalkIn && (
            <div className="mb-3 relative">
              <input style={input}
                className="w-full rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                placeholder="Search student name…"
                value={walkInSearch}
                onChange={e => setWalkInSearch(e.target.value)}
                autoFocus />
              {walkInSuggestions.length > 0 && (
                <div style={{ backgroundColor: "#0D1F3C", border: "1px solid rgba(0,229,204,0.2)", top: "calc(100% + 4px)" }}
                  className="absolute left-0 right-0 rounded-xl overflow-hidden z-10 shadow-xl">
                  {walkInSuggestions.map(k => (
                    <button key={k.id} onClick={() => addWalkIn(k)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 text-left transition-colors">
                      <span className="text-white text-sm">{k.name}</span>
                      <span style={{ backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" }}
                        className="text-xs px-2 py-0.5 rounded-full">{k.age_group}</span>
                    </button>
                  ))}
                </div>
              )}
              {walkInSearch.length > 1 && walkInSuggestions.length === 0 && (
                <p className="text-gray-500 text-xs mt-2">No students found.</p>
              )}
            </div>
          )}

          {walkIns.length === 0 && !showWalkIn && (
            <p className="text-gray-600 text-sm">No walk-ins yet.</p>
          )}

          <div className="space-y-2">
            {walkIns.map((w, i) => (
              <div key={w.kid_id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div style={{ backgroundColor: "rgba(251,191,36,0.15)", color: "#FCD34D" }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {w.kid?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <span className="text-white text-sm">{w.kid?.name || w.kid_id}</span>
                    <span style={{ color: "#FCD34D" }} className="text-xs ml-2">walk-in</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    style={{ ...STATUS_STYLE[w.status], border: "none", outline: "none", cursor: "pointer" }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    value={w.status}
                    onChange={e => setWalkIns(ws => ws.map((x, j) => j === i ? { ...x, status: e.target.value } : x))}
                    disabled={done}>
                    <option value="present" style={{ backgroundColor: "#0D1F3C", color: "white" }}>Present</option>
                    <option value="absent"  style={{ backgroundColor: "#0D1F3C", color: "white" }}>Absent</option>
                    <option value="late"    style={{ backgroundColor: "#0D1F3C", color: "white" }}>Late</option>
                  </select>
                  {!done && (
                    <button onClick={() => setWalkIns(ws => ws.filter((_, j) => j !== i))}
                      className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none">×</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="p-4 flex items-center gap-3">
          {done ? (
            <div style={{ backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" }}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold">
              ✓ Attendance submitted
            </div>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} style={btnPrimary}
              className="px-8 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all">
              {submitting ? "Submitting…" : "Submit Attendance ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}