import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom'

import ChatPage from './pages/Chat'
import CallLogsPage from './pages/CallLogs'
import FaqPage from './pages/Faq'

function Layout() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh' }}>
      <aside style={{ borderRight: '1px solid #e5e7eb', padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>
          <Link to="/">UEKI Console</Link>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <NavLink to="/chat">Chat</NavLink>
          <NavLink to="/call-logs">Call Logs</NavLink>
          <NavLink to="/faq">FAQ</NavLink>
        </nav>
      </aside>
      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<div>Welcome. Choose a section from the left.</div>} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="call-logs" element={<CallLogsPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="*" element={<div>Not Found</div>} />
      </Route>
    </Routes>
  )
}
