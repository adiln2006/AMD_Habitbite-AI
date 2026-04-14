import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HiOutlineViewGrid, HiOutlineMap, HiOutlineLightBulb, 
  HiOutlineBookOpen, HiOutlineCog, HiOutlineLogout,
  HiOutlinePencilAlt 
} from 'react-icons/hi';

const navItems = [
  { to: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard' },
  { to: '/roadmap', icon: HiOutlineMap, label: 'Roadmap' },
  { to: '/insights', icon: HiOutlineLightBulb, label: 'Insights' },
  { to: '/recipes', icon: HiOutlineBookOpen, label: 'Recipes' },
  { to: '/daily-log', icon: HiOutlinePencilAlt, label: 'Daily Log' },
  { to: '/settings', icon: HiOutlineCog, label: 'Settings' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <h1>HabitBite AI</h1>
          <span>Clinical Precision</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-link-icon"><Icon /></span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={logout}>
            <HiOutlineLogout />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
