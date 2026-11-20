import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Karteikarten from './pages/Karteikarten.jsx'
import Theorie from './pages/Theorie.jsx'
import Training from './pages/Training.jsx'
import Vergleich from './pages/Vergleich.jsx'
import Simulation from './pages/Simulation.jsx'
import Verwalten from './pages/Verwalten.jsx'
import Deutsch from './pages/Deutsch.jsx'
import DeutschKarten from './pages/DeutschKarten.jsx'
import DeutschLektion from './pages/DeutschLektion.jsx'
import DeutschKaliplar from './pages/DeutschKaliplar.jsx'
import DeutschTipps from './pages/DeutschTipps.jsx'
import DeutschWiederholung from './pages/DeutschWiederholung.jsx'
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
  { path: '/deutsch/lektion/:thema', element: <NurDeutsch><DeutschLektion /></NurDeutsch> },
  { path: '/deutsch/kaliplar', element: <NurDeutsch><DeutschKaliplar /></NurDeutsch> },
  { path: '/deutsch/tipps', element: <NurDeutsch><DeutschTipps /></NurDeutsch> },
  { path: '/deutsch/wiederholung', element: <NurDeutsch><DeutschWiederholung /></NurDeutsch> },
  // Alte Adresse der Grammatikseiten
  { path: '/deutsch/grammatik/:thema', element: <AlteGrammatik /> },
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

function AlteGrammatik() {
  const { thema } = useParams()
  return <Navigate to={`/deutsch/lektion/${thema}`} replace />
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
