import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from './Footer'
import Navbar from './Navbar'

export default function Layout() {
  const location = useLocation()
  const [routeLoading, setRouteLoading] = useState(false)

  useEffect(() => {
    setRouteLoading(true)
    const id = window.setTimeout(() => setRouteLoading(false), 520)
    return () => window.clearTimeout(id)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-brand-50 via-white to-brand-50">
      {routeLoading && <div className="page-loader" />}
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
