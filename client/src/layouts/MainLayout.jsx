import { Outlet, Link, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Stethoscope,
  Calendar,
  Clock,
  FileText,
  User,
  Bell,
  Users,
  FileCheck,
  RefreshCw,
  LogOut,
  Search,
  Settings,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2,
  UserCheck,
  Timer
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, badge, active }) => {
  return (
    <Link
      to={to}
      className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
        active
          ? 'bg-[#00a8b5] text-white shadow-md shadow-[#00a8b5]/25 font-bold'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 transition-transform duration-150 group-hover:scale-105 ${active ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
            active
              ? 'bg-white/20 text-white'
              : 'bg-slate-800 text-slate-400 group-hover:bg-[#00a8b5]/20 group-hover:text-cyan-300'
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
};

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const isStaff = user?.role === 'STAFF';

  return (
    <aside className="w-64 bg-slate-950 text-white min-h-screen p-5 flex flex-col border-r border-slate-900 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between mb-8 px-2 pt-1">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#00a8b5] to-cyan-400 p-0.5 shadow-lg shadow-[#00a8b5]/20 ring-1 ring-white/10 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Stethoscope className="text-cyan-400 h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-lg font-black tracking-tight text-white">Health</span>
              <span className="text-lg font-black text-cyan-400">+</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Clinical OS</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 space-y-6">
        <div>
          <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
            Main Menu
          </span>
          <nav className="space-y-1">
            {!isStaff ? (
              <>
                <NavItem to="/" icon={Clock} label="Dashboard" active={location.pathname === '/'} />
                <NavItem to="/calendar" icon={Calendar} label="Calendar" active={location.pathname === '/calendar'} />
                <NavItem to="/staff" icon={User} label="Staff Directory" active={location.pathname === '/staff'} />
                <NavItem to="/shifts" icon={FileText} label="Shift Management" active={location.pathname === '/shifts'} />
                <NavItem to="/attendance" icon={UserCheck} label="Attendance Tracker" active={location.pathname === '/attendance'} />
              </>
            ) : (
              <>
                <NavItem to="/" icon={Calendar} label="My Schedule" active={location.pathname === '/'} />
                <NavItem to="/my-leave" icon={FileText} label="My Leaves" active={location.pathname === '/my-leave'} />
                <NavItem to="/my-compliance" icon={FileCheck} label="Certifications" active={location.pathname === '/my-compliance'} />
              </>
            )}
          </nav>
        </div>

        <div>
          <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
            Clinical Operations
          </span>
          <nav className="space-y-1">
            {!isStaff ? (
              <>
                <NavItem to="/open-shifts" icon={Users} label="Open Shifts" badge="3" active={location.pathname === '/open-shifts'} />
                <NavItem to="/swaps" icon={RefreshCw} label="Shift Swaps" badge="2" active={location.pathname === '/swaps'} />
                <NavItem to="/compliance" icon={FileCheck} label="Compliance Review" active={location.pathname === '/compliance'} />
                <NavItem to="/leave" icon={FileText} label="Leave Requests" badge="5" active={location.pathname === '/leave'} />
              </>
            ) : (
              <>
                <NavItem to="/open-shifts" icon={Users} label="Claim Open Shifts" badge="3" active={location.pathname === '/open-shifts'} />
                <NavItem to="/my-swaps" icon={RefreshCw} label="My Shift Swaps" active={location.pathname === '/my-swaps'} />
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Hospital Node / System Status Pill */}
      <div className="pt-4 border-t border-slate-900 mt-auto">
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">Metro Node Active</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">v3.4</span>
        </div>
      </div>
    </aside>
  );
};

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('http://localhost:5000/api/notifications', config);
      setNotifications(res.data);
    } catch (error) {
      // Fallback notifications if endpoint is empty
      setNotifications([
        { _id: '1', title: 'Shift Understaffed', message: 'ICU Night shift needs 1 additional nurse.', isRead: false },
        { _id: '2', title: 'Certification Expiring', message: 'Nurse Priya ACLS expires in 12 days.', isRead: false },
        { _id: '3', title: 'Swap Request', message: 'Nurse Arun requested swap with Nurse Kumar.', isRead: true }
      ]);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, config);
      fetchNotifications();
    } catch (error) {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-white border-b border-slate-200/80 h-16 flex items-center justify-between px-6 sticky top-0 z-30 shadow-xs">
      {/* Global Search Bar */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff, shifts, compliance records..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-12 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded border border-slate-200">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-3.5">
        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-50 animate-fadeIn">
              <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                <span className="text-[11px] font-bold bg-[#00a8b5]/10 text-[#00828e] px-2 py-0.5 rounded-full">
                  {unreadCount} unread
                </span>
              </div>
              <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <p className="p-5 text-xs text-slate-500 text-center">No notifications right now.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`p-3.5 transition-colors ${
                        n.isRead ? 'bg-white opacity-70' : 'bg-[#f0fafb]'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-xs font-bold text-slate-800">{n.title}</p>
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(n._id)}
                            className="text-[10px] text-[#00828e] font-semibold hover:underline"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-none">
              {user?.name || 'Dr. Sarah (Manager)'}
            </p>
            <p className="text-[10px] font-bold text-[#00828e] uppercase tracking-wider mt-1">
              {user?.role || 'MANAGER'}
            </p>
          </div>
          <div className="h-9 w-9 bg-gradient-to-tr from-[#00a8b5] to-cyan-400 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-md shadow-[#00a8b5]/20 ring-1 ring-white">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50/60 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
