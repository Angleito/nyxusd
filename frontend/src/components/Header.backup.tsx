import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export const Header: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-purple-200' : 'text-white hover:text-purple-200'
  }

  return (
    <header className="header">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="logo">NyxUSD</h1>
            <p className="tagline">Privacy-First Stablecoin on Midnight Protocol</p>
          </div>
          <nav className="flex space-x-6">
            <Link to="/" className={`transition-colors ${isActive('/')}`}>
              Dashboard
            </Link>
            <Link to="/cdp" className={`transition-colors ${isActive('/cdp')}`}>
              My CDPs
            </Link>
            <Link to="/system" className={`transition-colors ${isActive('/system')}`}>
              System Stats
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}