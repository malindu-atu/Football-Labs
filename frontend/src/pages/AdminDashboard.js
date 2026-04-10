import { useEffect, useState } from "react";
import { getOverviewAnalytics, getAgeGroupAnalytics } from "../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from "recharts";
import { CalendarDays, GraduationCap, Users, TrendingUp, ArrowUpRight } from "lucide-react";

const COLORS = ["#00E5CC","#4DFFD2","#00C4AE","#009688","#80CBC4","#26A69A","#00897B","#00796B","#00695C","#004D40","#B2DFDB"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: "#0D1F3C", border: "1px solid rgba(0,229,204,0.2)", borderRadius: 10 }} className="p-3 text-sm shadow-xl">
        <p style={{ color: "#00E5CC" }} className="font-semibold mb-1">{label}</p>
        <p className="text-white font-bold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const STAT_CONFIGS = [
  { key: "total_sessions", label: "Total Sessions",  icon: CalendarDays, color: "#00E5CC", desc: "All time" },
  { key: "total_kids",     label: "Active Students", icon: GraduationCap, color: "#4DFFD2", desc: "Enrolled" },
  { key: "total_coaches",  label: "Coaches",         icon: Users,        color: "#A78BFA", desc: "Active staff" },
  { key: "overall_attendance_rate", label: "Attendance", icon: TrendingUp, color: "#FCD34D", desc: "Overall rate", suffix: "%" },
];

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [ageData, setAgeData] = useState([]);

  useEffect(() => {
    getOverviewAnalytics().then(r => setOverview(r.data));
    getAgeGroupAnalytics().then(r => {
      setAgeData(Object.entries(r.data).map(([name, value]) => ({ name, value: value.players ?? value })));
    });
  }, []);

  if (!overview) return (
    <div style={{ backgroundColor: "#060D1A" }} className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div style={{ borderColor: "#00E5CC" }} className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#060D1A", minHeight: "100vh" }} className="p-5 sm:p-7 lg:p-9">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Good morning, <span style={{ color: "#00E5CC" }}>Admin</span>
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Here's your academy overview for today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CONFIGS.map(({ key, label, icon: Icon, color, desc, suffix }) => (
          <div key={key}
            style={{ backgroundColor: "#0D1F3C", border: "1px solid rgba(255,255,255,0.07)" }}
            className="rounded-2xl p-5 flex flex-col gap-3 hover:border-cyan-500/30 transition-all group">
            <div className="flex items-center justify-between">
              <div style={{ backgroundColor: `${color}18`, color }}
                className="w-9 h-9 rounded-xl flex items-center justify-center">
                <Icon size={17} strokeWidth={2} />
              </div>
              <div style={{ color: "#00E5CC", backgroundColor: "rgba(0,229,204,0.08)" }}
                className="flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full">
                <ArrowUpRight size={11} />
                {desc}
              </div>
            </div>
            <div>
              <p style={{ color }} className="text-3xl font-extrabold tracking-tight">
                {overview[key]}{suffix || ""}
              </p>
              <p className="text-gray-500 text-xs mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div style={{ backgroundColor: "#0D1F3C", border: "1px solid rgba(255,255,255,0.07)" }} className="rounded-2xl p-5">
          <p className="text-white font-semibold mb-0.5">Students by Age Group</p>
          <p className="text-gray-500 text-xs mb-5">Distribution across all groups</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={ageData} barSize={20}>
              <XAxis dataKey="name" tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,229,204,0.04)" }} />
              <Bar dataKey="value" fill="url(#barGrad)" radius={[6,6,0,0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E5CC" stopOpacity={1} />
                  <stop offset="100%" stopColor="#00BFA5" stopOpacity={0.7} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ backgroundColor: "#0D1F3C", border: "1px solid rgba(255,255,255,0.07)" }} className="rounded-2xl p-5">
          <p className="text-white font-semibold mb-0.5">Age Group Distribution</p>
          <p className="text-gray-500 text-xs mb-5">Percentage breakdown</p>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={ageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}>
                {ageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ color: "#6B7280", fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}