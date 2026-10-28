import { Routes, Route, Navigate } from 'react-router'
import Home from './pages/Home'
import LessonPage from './pages/LessonPage'
import GameLab from './pages/GameLab'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game-lab" element={<GameLab />} />
      <Route path="/doc/:slug" element={<LessonPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
