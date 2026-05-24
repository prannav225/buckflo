import { NavLink } from 'react-router-dom';
import { Calendar, PiggyBank, Home, Plus, BarChart2 } from 'lucide-react';

export function BottomNav() {
  return (
    <div className="nav-wrapper" role="navigation" aria-label="App navigation">
      {/* Symmetrical 5-tab glass navigation pill */}
      <nav className="nav-pill" aria-label="Main navigation">
        {/* Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          aria-label="Home"
          id="nav-home"
        >
          <Home />
        </NavLink>

        {/* Monthly */}
        <NavLink
          to="/monthly"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          aria-label="Monthly"
          id="nav-monthly"
        >
          <Calendar />
        </NavLink>

        {/* Add Entry [+] */}
        <NavLink
          to="/add"
          className={({ isActive }) => `nav-item-fab${isActive ? ' active' : ''}`}
          aria-label="Add entry"
          id="nav-add"
        >
          <Plus />
        </NavLink>

        {/* Insights */}
        <NavLink
          to="/insights"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          aria-label="Insights"
          id="nav-insights"
        >
          <BarChart2 />
        </NavLink>

        {/* Savings */}
        <NavLink
          to="/savings"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          aria-label="Savings"
          id="nav-savings"
        >
          <PiggyBank />
        </NavLink>
      </nav>
    </div>
  );
}
