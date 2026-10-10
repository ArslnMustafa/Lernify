import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ExamTake from './pages/ExamTake.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exams/:id"
        element={
          <ProtectedRoute>
            <ExamTake />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
