import { Routes, Route, Navigate } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppLayout from './components/AppLayout.jsx'
import Title from './pages/Title.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import VerifyOtp from './pages/VerifyOtp.jsx'
import Home from './pages/Home.jsx'
import Profile from './pages/Profile.jsx'
import Settings from './pages/Settings.jsx'
import Play from './pages/Play.jsx'
import Quiz from './pages/Quiz.jsx'
import Case from './pages/Case.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import Shop from './pages/Shop.jsx'
import Squad from './pages/Squad.jsx'

// Route table for the whole app.
//
// Phase 2 adds the Title screen, the signed-in AppLayout frame, and the
// Home / Profile / Settings screens. Play, Quiz, Leaderboard, Friends and
// Shop are placeholders (ComingSoon) until their phases; the case team
// owns /case/:id.
export default function App() {
  return (
    <Routes>
      {/* Title screen - the game's entry point ("PRESS START"). */}
      <Route path="/" element={<Title />} />

      {/* Public auth screens. */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      {/* Signed-in screens - gated by auth, wrapped in the Sidebar +
          TopNav frame. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="/play" element={<Play />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/case/:id" element={<Case />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/friends" element={<Squad />} />
          <Route path="/shop" element={<Shop />} />
        </Route>
      </Route>

      {/* Unknown URLs fall back to the Title screen. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
