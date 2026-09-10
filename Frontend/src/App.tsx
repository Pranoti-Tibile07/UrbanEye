import { Route, Routes } from 'react-router-dom'

import { RequireAdmin, RequireAuth } from './components/auth/RequireAuth'
import Layout from './components/layout/Layout'
import AdminDashboard from './pages/AdminDashboard'
import Home from './pages/Home'
import Login from './pages/Login'
import MapPage from './pages/MapPage'
import MyReports from './pages/MyReports'
import NotFound from './pages/NotFound'
import Register from './pages/Register'
import ReportDetail from './pages/ReportDetail'
import ReportIssue from './pages/ReportIssue'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/report"
          element={
            <RequireAuth>
              <ReportIssue />
            </RequireAuth>
          }
        />
        <Route
          path="/reports"
          element={
            <RequireAuth>
              <MyReports />
            </RequireAuth>
          }
        />
        <Route
          path="/reports/:id"
          element={
            <RequireAuth>
              <ReportDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/map"
          element={
            <RequireAuth>
              <MapPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
