import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, PiggyBank } from 'lucide-react';

export function BottomNav() {
  return (
    <div className="nav-wrapper" role="navigation" aria-label="App navigation">
      {/* Symmetrical 4-tab glass navigation pill */}
      <nav className="nav-pill" aria-label="Main navigation">
        {/* Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          aria-label="Home"
          id="nav-home"
        >
          <LayoutDashboard />
          <span>Home</span>
        </NavLink>

        {/* Monthly */}
        <NavLink
          to="/monthly"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          aria-label="Monthly"
          id="nav-monthly"
        >
          <Calendar />
          <span>Monthly</span>
        </NavLink>

        {/* Savings */}
        <NavLink
          to="/savings"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          aria-label="Savings"
          id="nav-savings"
        >
          <PiggyBank />
          <span>Savings</span>
        </NavLink>
      </nav>
    </div>
  );
}
