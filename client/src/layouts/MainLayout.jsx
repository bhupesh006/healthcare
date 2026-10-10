import { Outlet, Link } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Stethoscope, Calendar, Clock, FileText, User, Bell, Users, FileCheck, RefreshCw, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const isStaff = user?.role === 'STAFF';

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-8 p-2">
        <Stethoscope className="text-primary-light h-8 w-8" />
        <span className="text-xl font-bold tracking-wide flex items-center">Health<span className="text-primary-light ml-0.5">+</span></span>
      </div>
      
      <nav className="flex-1 space-y-2">
        {!isStaff ? (
          <>
            <NavItem to="/" icon={<Clock size={20} />} label="Dashboard" />
            <NavItem to="/calendar" icon={<Calendar size={20} />} label="Roster Calendar" />
            <NavItem to="/staff" icon={<User size={20} />} label="Staff Directory" />
            <NavItem to="/shifts" icon={<FileText size={20} />} label="Shift Management" />
            <NavItem to="/open-shifts" icon={<Users size={20} />} label="Open Shifts" />
            <NavItem to="/swaps" icon={<RefreshCw size={20} />} label="Shift Swaps" />
            <NavItem to="/compliance" icon={<FileCheck size={20} />} label="Compliance Review" />
            <NavItem to="/leave" icon={<FileText size={20} />} label="Leave Requests" />
          </>
        ) : (
          <>
            <NavItem to="/" icon={<Calendar size={20} />} label="My Calendar" />
            <NavItem to="/my-leave" icon={<FileText size={20} />} label="Apply Leave" />
            <NavItem to="/my-compliance" icon={<FileCheck size={20} />} label="My Certifications" />
            <NavItem to="/open-shifts" icon={<Users size={20} />} label="Request Open Shifts" />
            <NavItem to="/my-swaps" icon={<RefreshCw size={20} />} label="My Shift Swaps" />
          </>
        )}
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
    {icon}
    <span>{label}</span>
  </Link>
);

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
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
      console.error(error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, config);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-end px-6 relative">
      <div className="flex items-center gap-4">
        
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          
          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden z-50">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Notifications</h3>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{unreadCount} new</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-slate-500 text-center">No notifications.</p>
                ) : (
                  notifications.map(n => (
                    <div key={n._id} className={`p-3 border-b border-slate-100 ${n.isRead ? 'opacity-60' : 'bg-blue-50/30'}`}>
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                        {!n.isRead && (
                          <button onClick={() => handleMarkAsRead(n._id)} className="text-xs text-primary hover:underline">Mark read</button>
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

        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900 leading-none">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 mt-1">{user?.role || 'Guest'}</p>
          </div>
          <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white font-medium shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
