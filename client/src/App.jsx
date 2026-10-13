import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ExamTake from './pages/ExamTake.jsx'
import Karteikarten from './pages/Karteikarten.jsx'
import Theorie from './pages/Theorie.jsx'
import Training from './pages/Training.jsx'
import Vergleich from './pages/Vergleich.jsx'
import Simulation from './pages/Simulation.jsx'
import Schreiben from './pages/Schreiben.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'

const PROTECTED = [
  { path: '/', element: <Navigate to="/training" replace /> },
  { path: '/probeklausur', element: <Dashboard /> },
  { path: '/exams/:id', element: <ExamTake /> },
  { path: '/karteikarten', element: <Karteikarten /> },
  { path: '/theorie', element: <Theorie /> },
  { path: '/training', element: <Training /> },
  { path: '/vergleich', element: <Vergleich /> },
  { path: '/simulation', element: <Simulation /> },
  { path: '/schreiben', element: <Schreiben /> },
]

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {PROTECTED.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={<ProtectedRoute>{element}</ProtectedRoute>}
        />
      ))}
    </Routes>
  )
}
