import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CaseSelect from './pages/CaseSelect'
import Case from './pages/Case'
import Debrief from './pages/Debrief'
import Leaderboard from './pages/Leaderboard'
import NotFound from './pages/NotFound'

// Top-level route map. Each page is currently a placeholder stub and will be
// replaced with the real UI once the design file is available.
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/cases" element={<CaseSelect />} />
      <Route path="/cases/:caseId" element={<Case />} />
      <Route path="/cases/:caseId/debrief" element={<Debrief />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
