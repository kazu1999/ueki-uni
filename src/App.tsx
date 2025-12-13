import '@aws-amplify/ui-react/styles.css'
import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom'
import { Amplify } from 'aws-amplify'
import { fetchUserAttributes } from 'aws-amplify/auth'
import { useEffect, useState } from 'react'
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react'
import { amplifyConfig } from './aws-exports'

import ChatPage from './pages/Chat'
import CallLogsPage from './pages/CallLogs'
import FaqPage from './pages/Faq'
import PromptPage from './pages/Prompt'
import FuncConfigPage from './pages/FuncConfig'
import TasksPage from './pages/Tasks'
import ExtToolsPage from './pages/ExtTools'

Amplify.configure(amplifyConfig)

function Layout() {
  const { signOut, user } = useAuthenticator()
  const [tenantId, setTenantId] = useState<string>('')
  
  useEffect(() => {
    fetchUserAttributes().then(attrs => {
      setTenantId(attrs['custom:tenant_id'] || attrs.email || 'user')
    }).catch(() => {
      setTenantId(user?.signInDetails?.loginId || 'user')
    })
  }, [user])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh' }}>
      <aside style={{ borderRight: '1px solid #e5e7eb', padding: 16, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>
          <Link to="/">UEKI Console</Link>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <NavLink to="/chat">Chat</NavLink>
          <NavLink to="/call-logs">Call Logs</NavLink>
          <NavLink to="/faq">FAQ</NavLink>
          <NavLink to="/prompt">Prompt</NavLink>
          <NavLink to="/func-config">Func Config</NavLink>
          <NavLink to="/tasks">DataBase</NavLink>
          <NavLink to="/ext-tools">External APIs</NavLink>
        </nav>
        <div style={{ marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: 12 }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 8, wordBreak: 'break-all' }}>
            Logged in as:<br/>{tenantId}
          </div>
          <button onClick={signOut} style={{ width: '100%', fontSize: 12, padding: 6 }}>Sign Out</button>
        </div>
      </aside>
      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Authenticator hideSignUp={true}>
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
    </Authenticator>
  )
}
