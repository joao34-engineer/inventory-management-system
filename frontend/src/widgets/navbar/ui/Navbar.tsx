import { useNavigate } from 'react-router-dom'
import { Button } from '@shared/ui'
import { useState } from 'react'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'PRODUCTS', path: '/products' },
  { label: 'SERVICES', path: '/services' },
  { label: 'CONTACT', path: '/contact' }
]

export const NavBar = (): React.JSX.Element => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const onLogout = () => {
    localStorage.removeItem('auth_token')
    navigate('/login')
  }

  return (
    <nav className='navigation'>
      <div className='navigation-inner'>
        <div className='navbar-brand'>
          <span className='logo-text'>MJT</span>
        </div>
      
        <div className='desktop-menu'>
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.path} className='nav-link'>{link.label}</a>
          ))}
        </div>

        <div className='navbar-actions'>
          <Button className='btn-action' onClick={onLogout}>
            Logout
          </Button>
        </div>
        <Button
          className='btn-nav-toggle'
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? '✕' : '☰'}
        </Button>
      </div>
      {isMenuOpen && (
        <div className='navbar-mobile-overlay'>
          <div className='navbar-links-mobile'>
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.path} className='nav-links-mobile'>{link.label}</a>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
