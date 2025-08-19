import React from 'react'
import { NavLink } from 'react-router-dom'
import './Sidebar.scss'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

interface MenuItem {
  path: string
  label: string
  icon: string
}

const menuItems: MenuItem[] = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/users', label: 'Users', icon: '👥' },
  { path: '/translations', label: 'Translations', icon: '🌐' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {menuItems.map((item) => (
            <li key={item.path} className="sidebar__menu-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <span className="sidebar__icon">{item.icon}</span>
                {!isCollapsed && <span className="sidebar__label">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <button
        className="sidebar__toggle"
        onClick={onToggle}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <span className={`sidebar__toggle-icon ${isCollapsed ? 'sidebar__toggle-icon--collapsed' : ''}`}>
          ◀
        </span>
      </button>
    </aside>
  )
}