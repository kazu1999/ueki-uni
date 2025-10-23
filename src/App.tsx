import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom'

import ChatPage from './pages/Chat'
import CallLogsPage from './pages/CallLogs'
import FaqPage from './pages/Faq'
import PromptPage from './pages/Prompt'
import FuncConfigPage from './pages/FuncConfig'
import TasksPage from './pages/Tasks'
import ExtToolsPage from './pages/ExtTools'

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
          <NavLink to="/prompt">Prompt</NavLink>
          <NavLink to="/func-config">Func Config</NavLink>
          <NavLink to="/tasks">DataBase</NavLink>
          <NavLink to="/ext-tools">External APIs</NavLink>
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
        <Route
          index
          element={
            <div>
              <div style={{ marginBottom: 8 }}>This system is linked to this number</div>
              <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 20 }}>
                +1 231 797 2645
              </div>
            </div>
          }
        />
        <Route path="chat" element={<ChatPage />} />
        <Route path="call-logs" element={<CallLogsPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="prompt" element={<PromptPage />} />
        <Route path="func-config" element={<FuncConfigPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="ext-tools" element={<ExtToolsPage />} />
        <Route path="*" element={<div>Not Found</div>} />
      </Route>
    </Routes>
  )
}
