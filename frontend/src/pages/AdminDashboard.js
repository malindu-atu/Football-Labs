import { useEffect, useState } from "react";
import { getOverviewAnalytics, getAgeGroupAnalytics } from "../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from "recharts";

const COLORS = ["#16a34a","#22c55e","#4ade80","#86efac","#bbf7d0",
                 "#dcfce7","#15803d","#14532d","#166534","#f0fdf4","#86efac"];

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [ageData, setAgeData] = useState([]);

  useEffect(() => {
    getOverviewAnalytics().then(r => setOverview(r.data));
    getAgeGroupAnalytics().then(r => {
      setAgeData(Object.entries(r.data).map(([name, value]) => ({ name, value })));
    });
  }, []);

  if (!overview) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Loading dashboard...</p>
    </div>
  );

  const stats = [
    { label: "Total Sessions", value: overview.total_sessions, icon: "📅" },
    { label: "Total Kids", value: overview.total_kids, icon: "👦" },
    { label: "Total Coaches", value: overview.total_coaches, icon: "🧑‍🏫" },
    { label: "Attendance Rate", value: `${overview.overall_attendance_rate}%`, icon: "✅" },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-6">Welcome back! Here's what's happening at the academy.</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(card => (
          <div key={card.label} className="bg-white rounded-xl p-6 shadow text-center">
            <p className="text-3xl mb-1">{card.icon}</p>
            <p className="text-3xl font-bold text-green-600">{card.value}</p>
            <p className="text-gray-500 text-sm mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="font-semibold mb-4 text-gray-700">Kids by Age Group</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#16a34a" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="font-semibold mb-4 text-gray-700">Age Group Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={ageData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={80} label>
                {ageData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}