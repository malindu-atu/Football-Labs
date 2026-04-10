import { useEffect, useState, useCallback } from "react";
import { CreditCard, ChevronLeft, ChevronRight, CheckCircle, XCircle, MinusCircle, Edit3 } from 'lucide-react';
import { getKids, getPayments, getPaymentSummary, upsertPayment } from "../api";
import { pageWrapper, card, input, btnPrimary } from "../components/UI";
import StudentFilter from "../components/StudentFilter";
import axios from "axios";

const api2 = axios.create({ baseURL: "http://localhost:8000/api" });
api2.interceptors.request.use(c => {
  const u = JSON.parse(localStorage.getItem("user"));
  if (u?.access_token) c.headers.Authorization = `Bearer ${u.access_token}`;
  return c;
});
const getLocations = () => api2.get("/locations");

const STATUS_CONFIG = {
  paid:   { label: "Paid",   color: "#00E5CC", bg: "rgba(0,229,204,0.12)",  icon: "✓" },
  unpaid: { label: "Unpaid", color: "#F87171", bg: "rgba(239,68,68,0.12)",  icon: "✕" },
  waived: { label: "Waived", color: "#FCD34D", bg: "rgba(251,191,36,0.12)", icon: "~" },
};

function toMonthStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(m) {
  const [y, mo] = m.split("-");
  return new Date(y, mo - 1).toLocaleString("default", { month: "long", year: "numeric" });
}

// ── Status toggle pill ──────────────────────────────────────────────────────
function StatusPill({ status, onClick, saving }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unpaid;
  return (
    <button
      onClick={onClick}
      disabled={saving}
      title="Click to cycle status"
      style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`, minWidth: 80 }}
      className="px-3 py-1 rounded-full text-xs font-semibold transition-all hover:opacity-80 flex items-center gap-1.5 justify-center"
    >
      <span>{cfg.icon}</span>
      {saving ? "…" : cfg.label}
    </button>
  );
}

// ── Note modal ──────────────────────────────────────────────────────────────
function NoteModal({ kid, month, existing, onSave, onClose }) {
  const [note, setNote] = useState(existing?.note || "");
  const [amount, setAmount] = useState(existing?.amount || "");
  const [status, setStatus] = useState(existing?.status || "unpaid");

  const handleSave = () => {
    onSave({ kid_id: kid.id, month, status, note: note || null, amount: amount ? parseFloat(amount) : null });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div style={{ backgroundColor: "#0D1F3C", border: "1px solid rgba(0,229,204,0.25)", maxWidth: 400, width: "100%" }}
        className="rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div style={{ backgroundColor: "rgba(0,229,204,0.15)", color: "#00E5CC" }}
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold">
            {kid.name.charAt(0)}
          </div>
          <div>
            <p className="text-white font-semibold">{kid.name}</p>
            <p className="text-gray-400 text-xs">{formatMonth(month)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Payment Status</label>
            <div className="flex gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => setStatus(key)}
                  style={status === key
                    ? { backgroundColor: cfg.color, color: "#0A1628" }
                    : { backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all">
                  {cfg.icon} {cfg.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Amount (LKR)</label>
            <input style={input} className="w-full rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              type="number" placeholder="e.g. 3500" value={amount}
              onChange={e => setAmount(e.target.value)} />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Note (optional)</label>
            <textarea style={input} className="w-full rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 resize-none"
              rows={3} placeholder="e.g. Paid in cash, partial payment, scholarship..."
              value={note} onChange={e => setNote(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={handleSave} style={btnPrimary}
            className="flex-1 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-all">
            Save
          </button>
          <button onClick={onClose}
            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#9CA3AF" }}
            className="px-5 py-2.5 rounded-lg text-sm hover:bg-white/5 transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function Payments() {
  const today = new Date();
  const [month, setMonth] = useState(toMonthStr(today));
  const [kids, setKids] = useState([]);
  const [paymentMap, setPaymentMap] = useState({});   // kid_id → payment record
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});            // kid_id → bool
  const [search, setSearch] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalKid, setModalKid] = useState(null);
  const [locations, setLocations] = useState([]);
  const [locationFilter, setLocationFilter] = useState("");

  const AGE_GROUPS = ["U6","U7","U8","U9","U10","U11","U12","U13","U14","U15","U16"];

  const load = useCallback(async () => {
    setLoading(true);
    const kidsParams = {};
    if (locationFilter) kidsParams.location_id = locationFilter;
    const [kidsRes, paymentsRes, summaryRes] = await Promise.all([
      getKids(kidsParams),
      getPayments(month),
      getPaymentSummary(month),
    ]);
    setKids(kidsRes.data);
    const map = {};
    for (const p of paymentsRes.data) map[p.kid_id] = p;
    setPaymentMap(map);
    setSummary(summaryRes.data);
    setLoading(false);
  }, [month, locationFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { getLocations().then(r => setLocations(r.data)); }, []);

  const cycleStatus = async (kid) => {
    const current = paymentMap[kid.id]?.status || "unpaid";
    const next = current === "unpaid" ? "paid" : current === "paid" ? "waived" : "unpaid";
    setSaving(s => ({ ...s, [kid.id]: true }));
    try {
      const res = await upsertPayment({
        kid_id: kid.id, month, status: next,
        amount: paymentMap[kid.id]?.amount || null,
        note: paymentMap[kid.id]?.note || null,
      });
      setPaymentMap(m => ({ ...m, [kid.id]: res }));
      // refresh summary
      getPaymentSummary(month).then(r => setSummary(r.data));
    } catch (e) {}
    setSaving(s => ({ ...s, [kid.id]: false }));
  };

  const saveModal = async (data) => {
    setModalKid(null);
    setSaving(s => ({ ...s, [data.kid_id]: true }));
    try {
      const res = await upsertPayment(data);
      setPaymentMap(m => ({ ...m, [data.kid_id]: res }));
      getPaymentSummary(month).then(r => setSummary(r.data));
    } catch (e) {}
    setSaving(s => ({ ...s, [data.kid_id]: false }));
  };

  // Mark all visible as paid
  const markAllPaid = async () => {
    const targets = filteredKids.filter(k => (paymentMap[k.id]?.status || "unpaid") !== "paid");
    for (const kid of targets) {
      await upsertPayment({ kid_id: kid.id, month, status: "paid",
        amount: paymentMap[kid.id]?.amount || null, note: paymentMap[kid.id]?.note || null });
    }
    load();
  };

  const prevMonth = () => {
    const d = new Date(month + "-01");
    d.setMonth(d.getMonth() - 1);
    setMonth(toMonthStr(d));
  };
  const nextMonth = () => {
    const d = new Date(month + "-01");
    d.setMonth(d.getMonth() + 1);
    setMonth(toMonthStr(d));
  };

  const filteredKids = kids.filter(k => {
    if (search && !k.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (ageFilter && k.age_group !== ageFilter) return false;
    if (statusFilter) {
      const s = paymentMap[k.id]?.status || "unpaid";
      if (s !== statusFilter) return false;
    }
    return true;
  });

  const collectionRate = summary?.collection_rate ?? 0;
  const rateColor = collectionRate >= 80 ? "#00E5CC" : collectionRate >= 50 ? "#FCD34D" : "#F87171";

  return (
    <div style={pageWrapper} className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Payments</h1>
          <p className="text-gray-400 mt-1 text-sm">Track monthly fees for all students</p>
        </div>

        {/* Month navigator */}
        <div className="flex items-center gap-2">
          <button onClick={prevMonth}
            style={{ backgroundColor: "#0D1F3C", border: "1px solid rgba(0,229,204,0.2)", color: "#00E5CC" }}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-cyan-500/10 transition-all text-lg">‹</button>
          <div style={{ backgroundColor: "#0D1F3C", border: "1px solid rgba(0,229,204,0.2)" }}
            className="px-4 py-2 rounded-lg">
            <span className="text-white font-semibold text-sm">{formatMonth(month)}</span>
          </div>
          <button onClick={nextMonth}
            style={{ backgroundColor: "#0D1F3C", border: "1px solid rgba(0,229,204,0.2)", color: "#00E5CC" }}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-cyan-500/10 transition-all text-lg">›</button>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Students", value: summary.total, color: "#9CA3AF" },
            { label: "Paid", value: summary.paid, color: "#00E5CC" },
            { label: "Unpaid", value: summary.unpaid, color: "#F87171" },
            { label: "Collection Rate", value: `${collectionRate}%`, color: rateColor },
          ].map(s => (
            <div key={s.label} style={card} className="rounded-xl p-4 text-center">
              <p style={{ color: s.color }} className="text-2xl font-bold">{s.value}</p>
              <p className="text-gray-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Collection rate bar */}
      {summary && (
        <div style={card} className="rounded-xl p-4 mb-6">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-400">Monthly Collection Progress</span>
            <span style={{ color: rateColor }} className="font-semibold">{collectionRate}%</span>
          </div>
          <div style={{ backgroundColor: "rgba(255,255,255,0.06)" }} className="rounded-full h-2">
            <div style={{ width: `${collectionRate}%`, backgroundColor: rateColor, transition: "width 0.6s ease" }}
              className="h-2 rounded-full" />
          </div>
          {summary.waived > 0 && (
            <p className="text-gray-500 text-xs mt-2">{summary.waived} student{summary.waived !== 1 ? "s" : ""} waived this month</p>
          )}
        </div>
      )}

      {/* Filters + actions */}
      <div style={card} className="rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <StudentFilter
            search={search} onSearch={setSearch}
            ageFilter={ageFilter} onAge={setAgeFilter}
            locationFilter={locationFilter} onLocation={setLocationFilter}
            locations={locations}
            resultCount={filteredKids.length}
          >
            <div className="flex items-center gap-2">
              <select style={{ ...input, backgroundImage: "none" }}
                className="rounded-lg px-3 py-2 text-sm focus:outline-none"
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="" style={{ backgroundColor: "#0D1F3C" }}>All Statuses</option>
                <option value="unpaid" style={{ backgroundColor: "#0D1F3C" }}>Unpaid</option>
                <option value="paid" style={{ backgroundColor: "#0D1F3C" }}>Paid</option>
                <option value="waived" style={{ backgroundColor: "#0D1F3C" }}>Waived</option>
              </select>
              <button onClick={markAllPaid} style={btnPrimary}
                className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all whitespace-nowrap">
                ✓ Mark Visible as Paid
              </button>
            </div>
          </StudentFilter>
        </div>

        {/* Mobile list */}
        <div className="block sm:hidden">
          {loading && <p className="p-6 text-center text-gray-500 text-sm">Loading…</p>}
          {filteredKids.map(k => {
            const p = paymentMap[k.id];
            const status = p?.status || "unpaid";
            const cfg = STATUS_CONFIG[status];
            return (
              <div key={k.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} className="p-4">
                <div className="flex items-center gap-3">
                  <div style={{ backgroundColor: "rgba(0,229,204,0.15)", color: "#00E5CC" }}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {k.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{k.name}</p>
                    <p className="text-gray-500 text-xs">{k.age_group}{p?.amount ? ` · LKR ${p.amount.toLocaleString()}` : ""}</p>
                    {p?.note && <p className="text-gray-600 text-xs truncate">{p.note}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={status} saving={saving[k.id]} onClick={() => cycleStatus(k)} />
                    <button onClick={() => setModalKid(k)}
                      style={{ color: "#9CA3AF" }} className="text-lg hover:text-white transition-colors" title="Edit details">
                      
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {!loading && filteredKids.length === 0 && (
            <p className="p-8 text-center text-gray-500 text-sm">No students match your filters.</p>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: "#0A1628" }}>
              <tr>
                {["Student", "Age Group", "Status", "Amount (LKR)", "Note", "Actions"].map(h => (
                  <th key={h} className="p-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading…</td></tr>
              )}
              {filteredKids.map(k => {
                const p = paymentMap[k.id];
                const status = p?.status || "unpaid";
                return (
                  <tr key={k.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                    className="hover:bg-white/2 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div style={{ backgroundColor: "rgba(0,229,204,0.15)", color: "#00E5CC" }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {k.name.charAt(0)}
                        </div>
                        <span className="text-white font-medium">{k.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span style={{ backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" }}
                        className="px-2 py-0.5 rounded-full text-xs">{k.age_group}</span>
                    </td>
                    <td className="p-4">
                      <StatusPill status={status} saving={saving[k.id]} onClick={() => cycleStatus(k)} />
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {p?.amount ? p.amount.toLocaleString() : <span className="text-gray-600">—</span>}
                    </td>
                    <td className="p-4 text-gray-500 text-xs max-w-[180px] truncate">
                      {p?.note || <span className="text-gray-700">—</span>}
                    </td>
                    <td className="p-4">
                      <button onClick={() => setModalKid(k)}
                        style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#9CA3AF" }}
                        className="px-3 py-1 rounded-lg text-xs hover:text-white hover:border-white/30 transition-all">
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredKids.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No students match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note/detail modal */}
      {modalKid && (
        <NoteModal
          kid={modalKid}
          month={month}
          existing={paymentMap[modalKid.id]}
          onSave={saveModal}
          onClose={() => setModalKid(null)}
        />
      )}
    </div>
  );
}