import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm px-3 py-2 rounded-lg transition-all duration-200 ${
        isActive(to)
          ? "bg-cyan-500 text-navy-900 font-semibold"
          : "text-gray-300 hover:text-cyan-400 hover:bg-white/5"
      }`}
      style={isActive(to) ? { backgroundColor: "#00E5CC", color: "#0A1628" } : {}}
    >
      {label}
    </Link>
  );

  return (
    <nav style={{ backgroundColor: "#0A1628", borderBottom: "1px solid rgba(0,229,204,0.15)" }}
      className="px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div style={{ backgroundColor: "#0D1F3C", border: "1px solid rgba(0,229,204,0.3)" }}
          className="w-9 h-9 rounded-lg flex items-center justify-center">
          <span className="text-lg">⚽</span>
        </div>
        <div>
          <span className="font-bold text-white text-lg tracking-wide">FBL</span>
          <span style={{ color: "#00E5CC" }} className="font-bold text-lg"> Academy</span>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-1">
        {user?.role === "admin" && (
          <>
            {navLink("/", "Dashboard")}
            {navLink("/coaches", "Coaches")}
            {navLink("/sessions", "Sessions")}
            {navLink("/kids", "Students")}
            {navLink("/attendance", "Attendance")}
            {navLink("/payments", "Payments")}
            {navLink("/analytics", "Analytics")}
          </>
        )}
        {user?.role === "coach" && (
          <>
            {navLink("/coach-portal", "My Portal")}
            {navLink("/attendance", "Attendance")}
          </>
        )}
      </div>

      {/* User info + logout */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-gray-400">{user?.role?.toUpperCase()}</p>
          <p className="text-sm text-white">{user?.coach?.name || "Admin"}</p>
        </div>
        <button
          onClick={handleLogout}
          style={{ border: "1px solid rgba(0,229,204,0.3)", color: "#00E5CC" }}
          className="px-4 py-1.5 rounded-lg text-sm hover:bg-cyan-500/10 transition-all">
          Logout
        </button>
      </div>
    </nav>
  );
}