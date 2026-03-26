import { useEffect, useState } from "react";
import { getOverviewAnalytics, getAgeGroupAnalytics } from "../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from "recharts";

const COLORS = ["#00E5CC","#4DFFD2","#00C4AE","#009688","#80CBC4","#26A69A","#00897B","#00796B","#00695C","#004D40","#B2DFDB"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: "#0D1F3C", border: "1px solid rgba(0,229,204,0.3)" }}
        className="rounded-lg p-3 text-sm">
        <p style={{ color: "#00E5CC" }}>{label}</p>
        <p className="text-white font-bold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

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
    <div style={{ backgroundColor: "#060D1A" }} className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div style={{ borderColor: "#00E5CC" }}
          className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  );

  const stats = [
    { label: "Total Sessions", value: overview.total_sessions, icon: "📅", desc: "All time" },
    { label: "Total Kids", value: overview.total_kids, icon: "👦", desc: "Active students" },
    { label: "Total Coaches", value: overview.total_coaches, icon: "🧑‍🏫", desc: "Active staff" },
    { label: "Attendance Rate", value: `${overview.overall_attendance_rate}%`, icon: "✅", desc: "Overall" },
  ];

  return (
    <div style={{ backgroundColor: "#060D1A", minHeight: "100vh" }} className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, <span style={{ color: "#00E5CC" }}>Admin</span> 👋
        </h1>
        <p className="text-gray-400 mt-1">Here's what's happening at FBL Academy today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((card, i) => (
          <div key={card.label} style={{
            backgroundColor: "#0D1F3C",
            border: "1px solid rgba(0,229,204,0.15)",
          }} className="rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span style={{ backgroundColor: "rgba(0,229,204,0.1)", color: "#00E5CC" }}
                className="text-xs px-2 py-0.5 rounded-full">{card.desc}</span>
            </div>
            <p style={{ color: "#00E5CC" }} className="text-3xl font-bold">{card.value}</p>
            <p className="text-gray-400 text-sm mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div style={{ backgroundColor: "#0D1F3C", border: "1px solid rgba(0,229,204,0.15)" }}
          className="rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-1">Kids by Age Group</h2>
          <p className="text-gray-400 text-xs mb-4">Distribution across all groups</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageData}>
              <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#00E5CC" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ backgroundColor: "#0D1F3C", border: "1px solid rgba(0,229,204,0.15)" }}
          className="rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-1">Age Group Distribution</h2>
          <p className="text-gray-400 text-xs mb-4">Percentage breakdown</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={ageData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={90} innerRadius={40}>
                {ageData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#9CA3AF", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}