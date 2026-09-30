import { useEffect, useState } from 'react';
import { api } from './api';
import Login from './components/Login';
import Board from './components/Board';
import ListView from './components/ListView';
import Dashboard from './components/Dashboard';
import TaskModal from './components/TaskModal';

const TABS = [
  ['dashboard', 'Dashboard'],
  ['board', 'Board'],
  ['list', 'List'],
];
const VIEWS = { board: Board, list: ListView, dashboard: Dashboard };

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!localStorage.getItem('token'));
  const [tab, setTab] = useState('dashboard');
  const [modal, setModal] = useState(null); // { task } để sửa hoặc { status } để tạo mới
  const [rev, setRev] = useState(0); // tăng lên để các view tải lại dữ liệu

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api('/auth/me')
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setReady(true));
  }, []);

  if (!ready) return null;
  if (!user)
    return (
      <Login
        onAuth={({ user, token }) => {
          localStorage.setItem('token', token);
          setUser(user);
        }}
      />
    );

  const logout = async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('token');
    setUser(null);
  };
  const View = VIEWS[tab];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">🟠 Taskflow</div>
        <nav>
          {TABS.map(([key, label]) => (
            <button key={key} className={tab === key ? 'nav active' : 'nav'} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="user">{user.name}</div>
          <button className="link" onClick={logout}>Đăng xuất</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>{tab === 'dashboard' ? `Chào mừng trở lại, ${user.name.split(' ').pop()}!` : 'My Tasks'}</h1>
            <p className="muted">{tab === 'dashboard' ? 'Đây là tình hình công việc của bạn hôm nay.' : 'Quản lý và theo dõi tiến độ công việc'}</p>
          </div>
          <button className="btn primary" onClick={() => setModal({ status: 'TODO' })}>+ Task mới</button>
        </header>
        {tab !== 'dashboard' && (
          <div className="tabs">
            {TABS.map(([key, label]) => (
              <button key={key} className={tab === key ? 'tab active' : 'tab'} onClick={() => setTab(key)}>
                {label}
              </button>
            ))}
          </div>
        )}
        <View rev={rev} onOpen={setModal} user={user} goto={setTab} />
      </main>

      {modal && (
        <TaskModal
          {...modal}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            setRev((r) => r + 1);
          }}
        />
      )}
    </div>
  );
}
