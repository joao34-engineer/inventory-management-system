import { NavLink } from "react-router-dom"
import { Button, DashboardIcon, MenuIcon, PlusIcon, SettingsIcon, InventoryIcon, CategoryIcon, BarChartIcon } from "@shared/ui"
import './SideBar.css'

interface SideBarProps {
  isExpended: boolean;
  onToggle: () => void;
}

export const SideBar = ({ isExpended, onToggle }: SideBarProps): React.JSX.Element => {
  const handleChartClick = () => {
    if (isExpended) {
      onToggle()
    }
    const element = document.getElementById('stock-chart-section')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <aside
      className={`sidebar ${isExpended ? 'open' : ''}`}
    >
      <div className='sidebar-header'>
        <Button className='sidebar-toggle' onClick={onToggle}>
          <MenuIcon />
        </Button>
      </div>

      <div className="sidebar-primary-action">
        <button type="button" className="gemini-new-btn">
          <span className='nav-icon'>
            <PlusIcon />
          </span>
          <span className='nav-label'>New Order</span>
        </button>
      </div>

      <nav className='sidebar-nav'>
        <span className="nav-section-title">Recent</span>
        <NavLink
          to='/dashboard'
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className='nav-icon'>
            <DashboardIcon />
          </span>
          <span className='nav-label'>Dashboard</span>
        </NavLink>

        <NavLink
          to='/products'
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className='nav-icon'><InventoryIcon /></span>
          <span className='nav-label'>Inventory</span>
        </NavLink>

        <NavLink
          to='/categories'
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className='nav-icon'><CategoryIcon /></span>
          <span className='nav-label'>Categories</span>
        </NavLink>

        <button
          onClick={handleChartClick}
          className="nav-item nav-action"
        >
          <span className='nav-icon'><BarChartIcon /></span>
          <span className='nav-label'>Analytics</span>
        </button>
      </nav>

      <div className='sidebar-footer'>
        <NavLink to='/settings' className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className='nav-icon'>
            <SettingsIcon />
          </span>
          <span className='nav-label'>Settings</span>
        </NavLink>
        <div className="admin-profile">
          <span className='nav-icon'>👤</span>
          <span className='nav-label'>MJT Admin</span>
        </div>
      </div>
    </aside>
  )
}
