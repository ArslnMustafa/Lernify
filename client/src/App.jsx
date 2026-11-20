import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Karteikarten from './pages/Karteikarten.jsx'
import Theorie from './pages/Theorie.jsx'
import Training from './pages/Training.jsx'
import Vergleich from './pages/Vergleich.jsx'
import Simulation from './pages/Simulation.jsx'
import Verwalten from './pages/Verwalten.jsx'
import Deutsch from './pages/Deutsch.jsx'
import DeutschKarten from './pages/DeutschKarten.jsx'
import DeutschGrammatik from './pages/DeutschGrammatik.jsx'
import { useAuth } from './auth/AuthContext.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'

// Probeklausur und Schreiben sind herausgenommen. Ihre Seiten
// (pages/Dashboard.jsx, pages/ExamTake.jsx, pages/Schreiben.jsx), ihre Daten in
// der Datenbank und ihre Endpunkte bleiben, damit die Abschnitte mit wenigen
// Zeilen zurückkommen können.
const PROTECTED = [
  // Wer Deutsch lernt, landet dort; alle anderen wie bisher im Trainer.
  { path: '/', element: <Start /> },
  { path: '/deutsch', element: <NurDeutsch><Deutsch /></NurDeutsch> },
  { path: '/deutsch/karten', element: <NurDeutsch><DeutschKarten /></NurDeutsch> },
  { path: '/deutsch/grammatik/:thema', element: <NurDeutsch><DeutschGrammatik /></NurDeutsch> },
  { path: '/karteikarten', element: <Karteikarten /> },
  { path: '/theorie', element: <Theorie /> },
  { path: '/training', element: <Training /> },
  { path: '/vergleich', element: <Vergleich /> },
  { path: '/simulation', element: <Simulation /> },
  { path: '/verwalten', element: <Verwalten /> },
  // An address that no longer exists — a bookmark to the old exam list, say —
  // leads to the trainer instead of an empty page.
  { path: '*', element: <Navigate to="/training" replace /> },
]

// Ohne Freischaltung fuehren die Deutsch-Adressen zum Trainer statt zu einer Fehlermeldung
function NurDeutsch({ children }) {
  const { user } = useAuth()
  return user?.deutsch ? children : <Navigate to="/training" replace />
}

function Start() {
  const { user } = useAuth()
  return <Navigate to={user?.deutsch ? '/deutsch' : '/training'} replace />
}

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
