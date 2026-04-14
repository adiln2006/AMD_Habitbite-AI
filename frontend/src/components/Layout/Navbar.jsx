import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineBell, HiOutlineMenu } from 'react-icons/hi';

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="mobile-toggle" onClick={onToggleSidebar}>
          <HiOutlineMenu />
        </button>
        <span className="navbar-brand">HabitBite AI</span>
        <div className="navbar-links">
          <NavLink to="/daily-log" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Daily Log
          </NavLink>
          <NavLink to="/insights" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Community
          </NavLink>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-notification">
          <HiOutlineBell />
          <span className="notification-dot" />
        </div>
        <NavLink to="/settings">
          <div className="navbar-avatar">{initials}</div>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
