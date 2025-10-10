import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RateDisplay from './components/RateDisplay'
import AdminPage from './components/AdminPage'
import SystemPage from './components/SystemPage'
import SuperAdminPage from './components/SuperAdminPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RateDisplay />} />
        <Route path="/admin2025" element={<AdminPage />} />
        <Route path="/system2025" element={<SystemPage />} />
        <Route path="/superadmin2025" element={<SuperAdminPage />} />
      </Routes>
    </Router>
  )
}
