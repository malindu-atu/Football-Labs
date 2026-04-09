import { useEffect, useState } from "react";
import { getCoaches, getKids, getKidsByAgeGroup } from "../api";
import { pageWrapper, card, input, btnPrimary, btnOutline } from "../components/UI";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000/api" });
api.interceptors.request.use(c => {
  const u = JSON.parse(localStorage.getItem("user"));
  if (u?.access_token) c.headers.Authorization = `Bearer ${u.access_token}`;
  return c;
});

const getTemplates = () => api.get("/sessions/templates");
const createTemplate = (d) => api.post("/sessions/templates", d);
const deleteTemplate = (id) => api.delete(`/sessions/templates/${id}`);
const updateEnrollments = (id, kid_ids) => api.put(`/sessions/templates/${id}/enrollments`, { kid_ids });
const generateWeek = () => api.post("/sessions/generate-week");

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const AGE_GROUPS = ["U6","U7","U8","U9","U10","U11","U12","U13","U14","U15","U16"];
const EMPTY_FORM = { day_of_week: "Monday", start_time: "", end_time: "", location_id: "", age_group: "U6", coach_id: "" };

export default function Sessions() {
  const [templates, setTemplates] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [allKids, setAllKids] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [enrollingTemplate, setEnrollingTemplate] = useState(null);
  const [selectedKids, setSelectedKids] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg] = useState("");

  const load = () => getTemplates().then(r => setTemplates(r.data));

  useEffect(() => {
    load();
    getCoaches().then(r => setCoaches(r.data));
    getKids().then(r => setAllKids(r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createTemplate({ ...form, coach_id: form.coach_id || null, location_id: form.location_id });
    load();
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this fixed session?")) return;
    await deleteTemplate(id);
    load();
  };

  const openEnroll = (t) => {
    setEnrollingTemplate(t);
    const enrolled = t.session_enrollments?.map(e => e.kid_id) || [];
    setSelectedKids(enrolled);
  };

  const saveEnrollments = async () => {
    await updateEnrollments(enrollingTemplate.id, selectedKids);
    setEnrollingTemplate(null);
    load();
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenMsg("");
    try {
      const res = await generateWeek();
      setGenMsg(`✓ ${res.data.message}`);
    } catch (e) {
      setGenMsg("Failed to generate sessions.");
    }
    setGenerating(false);
  };

  const toggleKid = (id) => setSelectedKids(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const filteredKids = enrollingTemplate
    ? allKids.filter(k => k.age_group === enrollingTemplate.age_group)
    : [];

  return (
    <div style={pageWrapper} className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Fixed Sessions</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage your weekly recurring training sessions</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleGenerate} disabled={generating}
            style={btnOutline}
            className="px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap">
            {generating ? "Generating…" : "⟳ Generate This Week"}
          </button>
          <button onClick={() => setShowForm(f => !f)} style={btnPrimary}
            className="px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all whitespace-nowrap">
            {showForm ? "✕ Cancel" : "+ Add Fixed Session"}
          </button>
        </div>
      </div>

      {genMsg && (
        <div style={{ backgroundColor: "rgba(0,229,204,0.1)", border: "1px solid rgba(0,229,204,0.3)" }}
          className="rounded-xl p-3 mb-4 text-cyan-400 text-sm">{genMsg}</div>
      )}

      {showForm && (
        <div style={card} className="rounded-2xl p-5 mb-6">
          <h2 className="font-semibold text-white mb-4">New Fixed Session</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Day of Week</label>
              <select style={{ ...input, backgroundImage: "none" }} className="w-full rounded-lg p-3 text-sm focus:outline-none"
                value={form.day_of_week} onChange={e => setForm(f => ({ ...f, day_of_week: e.target.value }))}>
                {DAYS.map(d => <option key={d} style={{ backgroundColor: "#0D1F3C" }}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Start Time</label>
              <input style={input} type="time" className="w-full rounded-lg p-3 text-sm focus:outline-none"
                value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">End Time</label>
              <input style={input} type="time" className="w-full rounded-lg p-3 text-sm focus:outline-none"
                value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Age Group</label>
              <select style={{ ...input, backgroundImage: "none" }} className="w-full rounded-lg p-3 text-sm focus:outline-none"
                value={form.age_group} onChange={e => setForm(f => ({ ...f, age_group: e.target.value }))}>
                {AGE_GROUPS.map(g => <option key={g} style={{ backgroundColor: "#0D1F3C" }}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Location ID</label>
              <input style={input} className="w-full rounded-lg p-3 text-sm focus:outline-none"
                placeholder="Paste location UUID" value={form.location_id}
                onChange={e => setForm(f => ({ ...f, location_id: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Coach</label>
              <select style={{ ...input, backgroundImage: "none" }} className="w-full rounded-lg p-3 text-sm focus:outline-none"
                value={form.coach_id} onChange={e => setForm(f => ({ ...f, coach_id: e.target.value }))}>
                <option value="" style={{ backgroundColor: "#0D1F3C" }}>No coach yet</option>
                {coaches.map(c => <option key={c.id} value={c.id} style={{ backgroundColor: "#0D1F3C" }}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <button style={btnPrimary} className="px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-all" type="submit">
                + Add Fixed Session
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates list */}
      <div style={card} className="rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h2 className="font-semibold text-white">Weekly Schedule ({templates.length} sessions)</h2>
        </div>
        {templates.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-gray-500 text-sm">No fixed sessions yet. Add one above.</p>
          </div>
        )}
        {templates.map(t => (
          <div key={t.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} className="p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div style={{ backgroundColor: "rgba(0,229,204,0.15)", color: "#00E5CC" }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {t.day_of_week.slice(0, 3).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-semibold">{t.day_of_week}</span>
                    <span style={{ backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" }}
                      className="px-2 py-0.5 rounded-full text-xs">{t.age_group}</span>
                  </div>
                  <p className="text-gray-400 text-sm">⏰ {t.start_time} – {t.end_time}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    🧑‍🏫 {t.coaches?.name || "No coach"} · 👦 {t.session_enrollments?.length || 0} enrolled students
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEnroll(t)}
                  style={btnOutline}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all">
                  👦 Manage Students
                </button>
                <button onClick={() => handleDelete(t.id)}
                  style={{ color: "#F87171", border: "1px solid rgba(248,113,113,0.2)" }}
                  className="px-3 py-1.5 rounded-lg text-xs hover:bg-red-500/10 transition-all">
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enrollment modal */}
      {enrollingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }} onClick={() => setEnrollingTemplate(null)}>
          <div style={{ backgroundColor: "#0D1F3C", border: "1px solid rgba(0,229,204,0.25)", maxWidth: 480, width: "100%" }}
            className="rounded-2xl p-6 shadow-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold">Enrolled Students</h2>
                <p className="text-gray-400 text-xs mt-0.5">{enrollingTemplate.day_of_week} {enrollingTemplate.age_group} · {filteredKids.length} eligible students</p>
              </div>
              <span style={{ backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" }}
                className="px-2 py-0.5 rounded-full text-xs">{selectedKids.length} selected</span>
            </div>
            <div className="overflow-y-auto flex-1 space-y-1 mb-4">
              {filteredKids.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-6">No {enrollingTemplate.age_group} students found.</p>
              )}
              {filteredKids.map(k => {
                const selected = selectedKids.includes(k.id);
                return (
                  <button key={k.id} onClick={() => toggleKid(k.id)}
                    style={selected
                      ? { backgroundColor: "rgba(0,229,204,0.12)", border: "1px solid rgba(0,229,204,0.4)" }
                      : { backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left">
                    <div style={selected ? { backgroundColor: "#00E5CC", color: "#0A1628" } : { backgroundColor: "rgba(0,229,204,0.15)", color: "#00E5CC" }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {selected ? "✓" : k.name.charAt(0)}
                    </div>
                    <span className="text-white text-sm">{k.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button onClick={saveEnrollments} style={btnPrimary}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-all">
                Save
              </button>
              <button onClick={() => setEnrollingTemplate(null)} style={btnOutline}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}