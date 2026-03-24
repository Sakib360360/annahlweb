import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Gallery from './pages/Gallery'
import Testimonials from './pages/Testimonials'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import AdminDashboard from './pages/AdminDashboard'
import PrivateRoute from './auth/PrivateRoute'
import { AuthProvider } from './auth/AuthProvider'
import { NotificationProvider } from './contexts/NotificationContext'
import Admission from './pages/Admission'
import Curriculum from './pages/Curriculum'
// Management
import ManagementLogin from './pages/management/ManagementLogin'
import ManagementLayout from './pages/management/ManagementLayout'
import MgmtOverview from './pages/management/MgmtOverview'
import MgmtStudents from './pages/management/MgmtStudents'
import MgmtAcademic from './pages/management/MgmtAcademic'
import MgmtAdministration from './pages/management/MgmtAdministration'
import MgmtTaskDashboard from './pages/management/MgmtTaskDashboard'
import MgmtTimeline from './pages/management/MgmtTimeline'
import MgmtAdminStaff from './pages/management/MgmtAdminStaff'
import ManagementRoute from './auth/ManagementRoute'

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="login" element={<Login />} />
            <Route path="admission" element={<Admission />} />
            <Route path="curriculum" element={<Curriculum />} />

            <Route
              path="student-dashboard"
              element={
                <PrivateRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="teacher-dashboard"
              element={
                <PrivateRoute allowedRoles={["teacher"]}>
                  <TeacherDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="admin-dashboard"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
          </Route>

          {/* ── Management Dashboard ────────────── */}
          <Route path="/management/login" element={<ManagementLogin />} />
          <Route
            path="/management"
            element={
              <ManagementRoute>
                <ManagementLayout />
              </ManagementRoute>
            }
          >
            <Route index element={<MgmtOverview />} />
            <Route path="overview" element={<MgmtOverview />} />
            <Route path="students" element={<MgmtStudents />} />
            <Route path="academic" element={<MgmtAcademic />} />
            <Route path="administration" element={<MgmtAdministration />} />
            <Route path="tasks" element={<MgmtTaskDashboard />} />
            <Route path="timeline" element={<MgmtTimeline />} />
            <Route path="admin-staff" element={<MgmtAdminStaff />} />
          </Route>
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  )
}
