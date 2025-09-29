import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RateDisplay from './components/RateDisplay'
import AdminPage from './components/AdminPage'
import SystemPage from './components/SystemPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RateDisplay />} />
        <Route path="/admin2025" element={<AdminPage />} />
        <Route path="/system2025" element={<SystemPage />} />
      </Routes>
    </Router>
  )
}
