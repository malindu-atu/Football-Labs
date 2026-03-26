import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-green-700 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg">⚽ Academy</span>
        {user?.role === "admin" && (
          <>
            <Link to="/" className="hover:underline text-sm">Dashboard</Link>
            <Link to="/coaches" className="hover:underline text-sm">Coaches</Link>
            <Link to="/sessions" className="hover:underline text-sm">Sessions</Link>
            <Link to="/kids" className="hover:underline text-sm">Kids</Link>
            <Link to="/attendance" className="hover:underline text-sm">Attendance</Link>
            <Link to="/analytics" className="hover:underline text-sm">Analytics</Link>
          </>
        )}
        {user?.role === "coach" && (
          <>
            <Link to="/coach-portal" className="hover:underline text-sm">My Portal</Link>
            <Link to="/attendance" className="hover:underline text-sm">Attendance</Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-green-200">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="bg-green-800 px-4 py-1 rounded text-sm hover:bg-green-900">
          Logout
        </button>
      </div>
    </nav>
  );
}