import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './screens/Home.tsx'

// On wide screens the app is a fixed-width column (up to 480 px) centered on the page.
export default function App() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[480px]">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
