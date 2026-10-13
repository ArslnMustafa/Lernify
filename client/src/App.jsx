import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Karteikarten from './pages/Karteikarten.jsx'
import Theorie from './pages/Theorie.jsx'
import Training from './pages/Training.jsx'
import Vergleich from './pages/Vergleich.jsx'
import Simulation from './pages/Simulation.jsx'
import Schreiben from './pages/Schreiben.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'

// Probeklausur ist herausgenommen. Die Seiten (pages/Dashboard.jsx,
// pages/ExamTake.jsx), die Prüfungen in der Datenbank und /api/exams bleiben,
// damit der Abschnitt mit wenigen Zeilen zurückkommen kann.
const PROTECTED = [
  { path: '/', element: <Navigate to="/training" replace /> },
  { path: '/karteikarten', element: <Karteikarten /> },
  { path: '/theorie', element: <Theorie /> },
  { path: '/training', element: <Training /> },
  { path: '/vergleich', element: <Vergleich /> },
  { path: '/simulation', element: <Simulation /> },
  { path: '/schreiben', element: <Schreiben /> },
  // An address that no longer exists — a bookmark to the old exam list, say —
  // leads to the trainer instead of an empty page.
  { path: '*', element: <Navigate to="/training" replace /> },
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
