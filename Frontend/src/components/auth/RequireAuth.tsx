import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

import { useAuth } from '../../auth/AuthContext'
import { Spinner } from '../ui/Spinner'

function FullPageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner className="h-8 w-8 text-teal-500" />
    </div>
  )
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageSpinner />

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return <FullPageSpinner />

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
