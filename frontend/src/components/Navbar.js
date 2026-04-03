import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks =
    user?.role === "admin"
      ? [
          { to: "/", label: "Dashboard" },
          { to: "/coaches", label: "Coaches" },
          { to: "/sessions", label: "Sessions" },
          { to: "/kids", label: "Kids" },
          { to: "/attendance", label: "Attendance" },
          { to: "/analytics", label: "Analytics" },
        ]
      : user?.role === "coach"
      ? [
          { to: "/coach-portal", label: "My Portal" },
          { to: "/attendance", label: "Attendance" },
        ]
      : [];

  const NavLink = ({ to, label, mobile = false }) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`transition-all duration-200 ${
        mobile
          ? `block px-4 py-3 rounded-lg text-sm font-medium ${
              isActive(to) ? "font-semibold" : "text-gray-300 hover:text-white hover:bg-white/5"
            }`
          : `text-sm px-3 py-2 rounded-lg ${
              isActive(to) ? "font-semibold" : "text-gray-300 hover:text-white hover:bg-white/5"
            }`
      }`}
      style={isActive(to) ? { backgroundColor: "#00E5CC", color: "#0A1628" } : {}}
    >
      {label}
    </Link>
  );

  return (
    <nav
      style={{ backgroundColor: "#0A1628", borderBottom: "1px solid rgba(0,229,204,0.15)" }}
      className="px-4 sm:px-6 py-3 sticky top-0 z-50"
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            style={{ backgroundColor: "#0D1F3C", border: "1px solid rgba(0,229,204,0.3)" }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center"
          >
            <span className="text-base sm:text-lg">⚽</span>
          </div>
          <div>
            <span className="font-bold text-white text-base sm:text-lg tracking-wide">FBL</span>
            <span style={{ color: "#00E5CC" }} className="font-bold text-base sm:text-lg"> Academy</span>
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => <NavLink key={l.to} to={l.to} label={l.label} />)}
        </div>

        {/* Desktop user + logout */}
        <div className="hidden md:flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-400">{user?.role?.toUpperCase()}</p>
            <p className="text-sm text-white">{user?.coach?.name || "Admin"}</p>
          </div>
          <button
            onClick={handleLogout}
            style={{ border: "1px solid rgba(0,229,204,0.3)", color: "#00E5CC" }}
            className="px-4 py-1.5 rounded-lg text-sm hover:bg-cyan-500/10 transition-all"
          >
            Logout
          </button>
        </div>

        {/* Mobile: avatar + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <div
            style={{ backgroundColor: "#00E5CC", color: "#0A1628" }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          >
            {(user?.coach?.name || "A").charAt(0)}
          </div>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={{ color: "#00E5CC" }}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-all"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          style={{ borderTop: "1px solid rgba(0,229,204,0.1)" }}
          className="md:hidden mt-3 pt-3 pb-2 space-y-1"
        >
          {navLinks.map((l) => <NavLink key={l.to} to={l.to} label={l.label} mobile />)}
          <div
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            className="mt-3 pt-3 flex items-center justify-between px-1"
          >
            <div>
              <p className="text-xs text-gray-400">{user?.role?.toUpperCase()}</p>
              <p className="text-sm text-white">{user?.coach?.name || "Admin"}</p>
            </div>
            <button
              onClick={handleLogout}
              style={{ border: "1px solid rgba(0,229,204,0.3)", color: "#00E5CC" }}
              className="px-4 py-1.5 rounded-lg text-sm hover:bg-cyan-500/10 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}