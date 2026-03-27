import { useEffect, useState } from "react";
import { getNotifications, markNotificationRead, addAvailability } from "../api";
import { useAuth } from "../context/AuthContext";
import { pageWrapper, card, input, btnPrimary } from "../components/UI";

export default function CoachPortal() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({ date: "", start_time: "", end_time: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user?.coach?.id) {
      getNotifications(user.coach.id).then(r => setNotifications(r.data));
    }
  }, [user]);

  const handleAvailability = async (e) => {
    e.preventDefault();
    await addAvailability({ ...form, coach_id: user.coach.id });
    setSubmitted(true);
    setForm({ date: "", start_time: "", end_time: "" });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleRead = async (id) => {
    await markNotificationRead(id);
    setNotifications(notifications.map(n => n.id === id ? {...n, is_read: true} : n));
  };

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <div style={pageWrapper} className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Welcome, <span style={{ color: "#00E5CC" }}>{user?.coach?.name}</span> 👋
        </h1>
        <p className="text-gray-400 mt-1 text-sm">Age groups: {user?.coach?.age_groups?.join(", ")}</p>
      </div>

      {/* Stacked on mobile, side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Availability */}
        <div style={card} className="rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xl">📅</span>
            <h2 className="font-semibold text-white">Submit Availability</h2>
          </div>

          {submitted && (
            <div style={{ backgroundColor: "rgba(0,229,204,0.1)", border: "1px solid rgba(0,229,204,0.3)" }}
              className="rounded-lg p-3 mb-4 text-sm">
              <span style={{ color: "#00E5CC" }}>✅ Availability submitted successfully!</span>
            </div>
          )}

          <form onSubmit={handleAvailability} className="space-y-4">
            {[
              { label: "Date", key: "date", type: "date" },
              { label: "Start Time", key: "start_time", type: "time" },
              { label: "End Time", key: "end_time", type: "time" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-400 mb-1.5 block">{f.label}</label>
                <input style={input}
                  className="w-full rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  type={f.type} value={form[f.key]}
                  onChange={e => setForm({...form, [f.key]: e.target.value})} required />
              </div>
            ))}
            <button style={btnPrimary}
              className="w-full py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-all"
              type="submit">
              Submit Availability
            </button>
          </form>
        </div>

        {/* Notifications */}
        <div style={card} className="rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔔</span>
              <h2 className="font-semibold text-white">Notifications</h2>
            </div>
            {unread > 0 && (
              <span style={{ backgroundColor: "#00E5CC", color: "#0A1628" }}
                className="text-xs px-2 py-0.5 rounded-full font-bold">
                {unread} new
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ backgroundColor: "#0A1628" }} className="rounded-xl p-8 text-center">
              <p className="text-3xl mb-2">🔕</p>
              <p className="text-gray-500 text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {notifications.map(n => (
                <div key={n.id}
                  style={n.is_read
                    ? { backgroundColor: "#0A1628", border: "1px solid rgba(255,255,255,0.05)" }
                    : { backgroundColor: "rgba(0,229,204,0.05)", border: "1px solid rgba(0,229,204,0.2)", borderLeft: "3px solid #00E5CC" }}
                  className="rounded-lg p-3">
                  <p className="text-sm text-white">{n.message}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                    {!n.is_read && (
                      <button onClick={() => handleRead(n.id)}
                        style={{ color: "#00E5CC" }}
                        className="text-xs hover:underline">
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}