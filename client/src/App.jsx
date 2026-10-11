import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ExamTake from './pages/ExamTake.jsx'
import Karteikarten from './pages/Karteikarten.jsx'
import Theorie from './pages/Theorie.jsx'
import Training from './pages/Training.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'

const PROTECTED = [
  { path: '/', element: <Dashboard /> },
  { path: '/exams/:id', element: <ExamTake /> },
  { path: '/karteikarten', element: <Karteikarten /> },
  { path: '/theorie', element: <Theorie /> },
  { path: '/training', element: <Training /> },
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
