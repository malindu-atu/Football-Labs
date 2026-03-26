import { useEffect, useState } from "react";
import { getNotifications, markNotificationRead, addAvailability } from "../api";
import { useAuth } from "../context/AuthContext";

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
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-700">Welcome, {user?.coach?.name} 👋</h1>
        <p className="text-gray-500">Age groups: {user?.coach?.age_groups?.join(", ")}</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Availability */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4 text-gray-700">📅 Submit Availability</h2>
          {submitted && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded p-3 mb-4 text-sm">
              ✅ Availability submitted successfully!
            </div>
          )}
          <form onSubmit={handleAvailability} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date</label>
              <input className="w-full border rounded p-2 text-sm" type="date"
                value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Start Time</label>
              <input className="w-full border rounded p-2 text-sm" type="time"
                value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} required />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">End Time</label>
              <input className="w-full border rounded p-2 text-sm" type="time"
                value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} required />
            </div>
            <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm" type="submit">
              Submit Availability
            </button>
          </form>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">🔔 Notifications</h2>
            {unread > 0 && (
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">{unread} new</span>
            )}
          </div>
          {notifications.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">No notifications yet</p>
          )}
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id}
                className={`p-3 rounded-lg ${n.is_read ? "bg-gray-50" : "bg-green-50 border-l-4 border-green-500"}`}>
                <p className="text-sm">{n.message}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                  {!n.is_read && (
                    <button onClick={() => handleRead(n.id)}
                      className="text-xs text-green-600 hover:underline">
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}